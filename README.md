![alt text][logo]

# Drive Fine
Have you ever received a traffic ticket and immediately forgotten about it, consequently leading to a bench warrant and maybe even an arrest? Subscribe to notifications of driver license status changes, court dates reminder and updates via email, SMS, and automated phone calls.

[Signup for early access](https://drivefine.com)

![alt text][sms-example]


## Counties and APis
* Miami-Dade County - has API for driver license
* Broward County - has API but no endpoint for DL status web view at: https://www.browardclerk.org/Clerkwebsite/BCCOC2/Pubsearch/dl_stat_verif.aspx?DRVNUM=
* Orange Country - API abilities not clear, no way to search by DL submitted request to support for additional info
* flhsmv - The most authorative of the sources, no API, captcha on check: https://services.flhsmv.gov/DLCheck/
* DAVID - includes Vehicle information but https://david.flhsmv.gov/

---

### RoadMap

#### Security
* Implement pgcrypto for PII - Long Term

#### Infra
* confgiure VPC with static IP address - done
* ADD mutli-az dr for RDS
* add RDS Proxy

#### Schema
* Finalize schema for reports and subscribers

#### Design
* Complete Landing page
* [multi-lingual](https://support.google.com/webmasters/answer/189077)
* add progress bar
* [best proactices](https://blog.hubspot.com/marketing/form-design)

#### Marketing
* facebook
* develop deck for specific user group
* Get out the word campagin (public defender offices)
* User testing
* Feedback
* Define Success Metrics
* Develop graphic 'how to' instruction set for each county supported (similar to plane inflight cards)


#### Features
* Models + DB
* Call/SMS Subscribe and verify
* Enforce Rate limit
* Allow multiple numbers with individual subscription types


[sms-example]: https://fcc-landing.s3.amazonaws.com/images/sms-example.png "Example SMS Message"
[logo]: https://fcc-landing.s3.amazonaws.com/images/recordchecker.png "FTW Logo"

## Local Development

Make sure you have "Serverless Framework" installed, install all the packages, and configure a secrets.json file with the relevant values.

## Improve Security
aws account has 2FA
Database exists in VPC within Private subnet
Databse enforces SSL via rds.force_ssl paramater
t3 instance chosen to ensure data encryption at rest
TLS for front end

TODO
application user created with  SCRAM-SHA-256 Encryption
https://aws.amazon.com/blogs/database/managing-postgresql-users-and-roles/
https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-PASSWORD-ENCRYPTION
Move to service level accounts

# Next Actions

## Experince | Tasked 

What I learned since I have been here as a resident is that waiting in line is part of the queue. 
I feel like from a previously licensed out of state driver, having earned endorsements for Class A and M Vehicles from the department of Motor Vehicles in Oklahoma, that the system here is jammed with users and operations seems to be stressed and weak in the response to demand and the quality of drivers here does seem to suffer. Most of my time in transporting myself before and after earning my Licenses here, using the roads as a biker laned with initiatives in Ft. Lauderdale to literally pave the way with green space dedicated to laned trafficking bikers was great. But, even now this space is squeezed with electric operated personal vehicles and the rules become suggestions at best. Perhaps more developments could be continued for awareness and for winning best in service for tourism as well. (*Brad)

## Members
* Quyen
* Mireya
* Pedro
* Brad 
