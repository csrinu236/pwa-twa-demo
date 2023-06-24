// domain/.netlfiy/functions/hello

// ofcourse we set redirect to domain/.netlfiy/functions/hello
// if entered /api/hello

require('dotenv').config();

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const webpush = require('web-push');
const publicVapidKey =
  'BHkecfr7PKOLoUutqDCfRu_bAcMKVx6OHCtO1807Tl_vHpd-p_L70Hxoyzcuyt-gKB2I1YIr7m2gmBHtVcsNgfM';
const privateVapidKey = 'sP3vPJHopPh7IgBQT2lPrLS0yfcn_WUlOP85rf47V3M';

webpush.setVapidDetails(
  'mailto:csrinu236@gmail.com',
  publicVapidKey,
  privateVapidKey
);

const baseKey = 'appKJrqfuU6kZpYhP';

// const Airtable = require('airtable-node');

// const airtable = new Airtable({ apiKey: apiKey })
//   .base('appb1KDYLn7VPYVxQ')
//   .table('posts');

exports.handler = async (ev, context) => {
  const data = JSON.parse(ev.body);
  let subscriptionRecords = [];

  const payLoad = JSON.stringify({
    title: 'NEW Post',
    content: 'New Post Added',
    body: data.name + ' added a new post',
  });

  // getting all subscriptions to send notifications
  try {
    const subscriptionsTableBaseId = 'appghfRJKkloLxEXJ'; // subscriptions-table baseId
    const headers = {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    };
    subscriptionRecords = await fetch(
      `https://api.airtable.com/v0/${subscriptionsTableBaseId}/${encodeURIComponent(
        'subscriptions-table'
      )}`,
      {
        headers,
      }
    )
      .then((resp) => resp.json())
      .then(({ records }) =>
        records.map((eachRecord) => {
          return { subscription: JSON.parse(eachRecord.fields.subscription) };
        })
      );
  } catch (error) {
    console.log(error);
  }

  //   const body = await airtable.list().then((resp) => resp);

  // accepting post and getting subscriptions lo loop over them.
  const url = `https://api.airtable.com/v0/${baseKey}/${encodeURIComponent(
    'jobs-table'
  )}`;
  const headers = {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: data }),
      mode: 'no-cors',
    });

    if (response.ok) {
      const createdRecord = await response.json();
      subscriptionRecords.forEach(({ subscription }) => {
        // console.log({ subscription });
        webpush
          .sendNotification(subscription, payLoad)
          .catch((err) => console.log(err));
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Record created',
          record: createdRecord,
        }),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: 'Failed to create record' }),
      };
    }
  } catch (error) {
    console.error('Error creating record:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating record' }),
    };
  }

  //   return {
  //     statusCode: 201,
  //     body: JSON.stringify(body),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   };
};
