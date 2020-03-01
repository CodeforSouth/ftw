import {
  APIGatewayProxyHandler
} from 'aws-lambda';
import 'source-map-support/register';
import * as Knex from 'knex';
import {
  Model,
  knexSnakeCaseMappers
} from 'objection';

import {browardCountyCDLCheck} from './lib/functions/browardCountyCheck';

//Helpers
import {
  validateEmail,
  validatePhoneNumber,
  validateDLSubmission
} from './validators';
import {
  Subscription
} from './models/subscription'
import
DriverLicense
from './models/driverLicense';

import {
  sendEnrollmentConfirmation,
  sendReportSMS
} from './lib/functions/twilio';


// TYPES
import {
  SubscriptionRequest
} from './subscription';
import {
  DriverLicenseReport
} from './models/driverLicenseReport';

const knexConfig = require('./knexfile');


const knex = Knex({
  ...knexConfig,
  ...knexSnakeCaseMappers()
});

Model.knex(knex);


export const migrate: APIGatewayProxyHandler = async (event, _context) => {
  console.dir('here');
  await knex.migrate.latest(knexConfig);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Migration Ran',
      input: event,
    }, null, 2),
  };
}

/**
 * @param {string} dlNumber - Florida driverLicense For Miami Dade Selections
 * @returns {string} - success or error
 */
export const rundlReports: APIGatewayProxyHandler = async (_, _context) => {
  // log starting
  // log number of subs
  // log number of DL reports found vs making
// TODO switch to momment
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

  // get all valid Subscriptions with no notification in the last 30 days 
  // what if no notification but drivers report is last 30? 
  const dlIdsThatNeedReport = [];
  const validSubscriptions = await Subscription.query().where('unsubscribedOn', null);
  // extract just DL ids and transform to set for just unique values to reduce in unessecary addtional queries.


  // REWRITE THIS BIT 
  /*
      TODO
      find all subscriptions that don't have a dlreport sent to them in the last 30 days. (MAX ID is prob going to be best, but make sure to grab the row seperatly or make sure postgresql doesn't have this issue)
      per subscription, send the DL message ** this will mean redundant DL checks, but thats not a real problem right now.
      SO we track the report being run for that subscription, and track the message
      so send message, if message is sent, add to report, if not report and return with error.
      ALSO update report model/DB changes alls
  */
  for (const sub of validSubscriptions) {
    // most recent notification for that sub ID
    const lastDlReport = await DriverLicenseReport.query().where('driverLicenseId', sub.driverLicenseId).orderBy('createdOn', 'desc').where('createdOn', '>=', thirtyDaysAgo).first();
    if (!lastDlReport) {
      dlIdsThatNeedReport.push(sub.driverLicenseId);
    }
  }

  if (dlIdsThatNeedReport.length === 0) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: 'no subscriptions require report'
    };
  }

  const uniqueDlIds = [...new Set(dlIdsThatNeedReport)];

  const driverLicenses = await DriverLicense.query().whereIn('id', uniqueDlIds);
  for (const dl of driverLicenses) {
    try {

      const report = await browardCountyCDLCheck(dl.driverLicenseNumber);

      const message = await sendReportSMS()

        await DriverLicenseReport.query().insert({
          driverLicenseId: dl.id,
          contactMethod: 'SMS',
        });



    } catch (error) {
      // alert on these errors but don't halt thread cause we'll have to keep going
      console.error(`unable to process DLId ${dl.id}`);
      console.error(error);
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    // include number and some subscription ids?
    body: 'Reports run',
  };
}

export const subscription: APIGatewayProxyHandler = async (event, _context) => {
  const subscriptionRequest: SubscriptionRequest = JSON.parse(event.body);
  console.dir(subscriptionRequest)
  const {
    emailAddressClient,
    phoneNumberClient,
    driverLicenseIdClient,
    countyClient
  } = subscriptionRequest;
  if (typeof emailAddressClient !== 'string' || typeof driverLicenseIdClient !== "string" || typeof countyClient !== "string" || typeof phoneNumberClient !=="string") {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 400,
      // move to http error handling
      body: 'BAD REQUEST'
    };
  }
  try {
    console.dir(`starting validation`);
    const emailAddress = validateEmail(emailAddressClient);
    const phoneNumber =  validatePhoneNumber(phoneNumberClient);
    
    const {
      county,
      driverLicenseNumber
    } = validateDLSubmission(driverLicenseIdClient, countyClient);
    console.dir(`client validation ended`);
    // TODO upsert  (adjust for concurrency). INSPO https://gist.github.com/derhuerst/7b97221e9bc4e278d33576156e28e12d
    // TODO sanitaize return values from DB with try catch
    const existingDriverLicense = await DriverLicense.query().where('driverLicenseNumber', driverLicenseNumber).first()

    if (existingDriverLicense) {
      const existingSubscription = await Subscription.query().where({
        emailAddress,
        phoneNumber,
        driverLicenseId: existingDriverLicense.id
      }).first();

      if (existingDriverLicense.disabled || existingSubscription) {
        return {
          statusCode: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            message: 'This is a duplicate Subscription in our system. Please reach out to support@drivefine.com if you belive this is an Error'
          }),
        };
      }

      await Subscription.query().insert({
        emailAddress,
        phoneNumber,
        driverLicenseId: existingDriverLicense.id,
        subscribedOn: new Date()
      });

      console.dir(`enrolled sending sms`);
      await sendEnrollmentConfirmation(phoneNumberClient, driverLicenseIdClient);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'success'
        }),
      };
    }

    // DL isn't found, need to create before moving forward
    const newDriverLicense = await DriverLicense.query().insert({
      driverLicenseNumber,
      county,
      disabled: false
    });
    // TODO validate DL here or exit?
    await Subscription.query().insert({
      emailAddress,
      phoneNumber,
      driverLicenseId: newDriverLicense.id,
      subscribedOn: new Date()
    });

    await sendEnrollmentConfirmation(phoneNumberClient, driverLicenseIdClient);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'success'
      }),
    };
    // user signed up, sending sms notification
  } catch (error) {
    console.error(error);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 422,
      body: JSON.stringify({
        description: error.message
      }),
    };
  }
};