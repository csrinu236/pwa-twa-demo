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

const baseKey = 'appghfRJKkloLxEXJ';

// const Airtable = require('airtable-node');

// const airtable = new Airtable({ apiKey: apiKey })
//   .base('appb1KDYLn7VPYVxQ')
//   .table('posts');

exports.handler = async (ev, context) => {
  const data = JSON.parse(ev.body);
  console.log(data);

  //   const payLoad = JSON.stringify({
  //     title: 'New Post',
  //     content: 'New Post Added',
  //   });

  //   const body = await airtable.list().then((resp) => resp);

  const url = `https://api.airtable.com/v0/${baseKey}/${encodeURIComponent(
    'subscriptions-table'
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
      body: JSON.stringify({ message: 'Error creating record', error }),
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
