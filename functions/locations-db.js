// domain/.netlfiy/functions/hello

// ofcourse we set redirect to domain/.netlfiy/functions/hello
// if entered /api/hello

require('dotenv').config();

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// const Airtable = require('airtable-node');

// const airtable = new Airtable({ apiKey: apiKey })
//   .base('appb1KDYLn7VPYVxQ')
//   .table('posts');

exports.handler = async (ev, context) => {
  if (ev.httpMethod === 'GET') {
    try {
      const locationTableBaseId = 'appcEQn2WS81uwQbY';
      const headers = {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      };
      const locationsTable = await fetch(
        `https://api.airtable.com/v0/${locationTableBaseId}/${encodeURIComponent(
          'locations-table'
        )}`,
        { headers }
      )
        .then((resp) => resp.json())
        .then((data) => data);

      return {
        statusCode: 200,
        body: JSON.stringify(locationsTable),
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error' }),
      };
    }
  }

  if (ev.httpMethod === 'POST') {
    try {
      const data = JSON.parse(ev?.body);
      //   console.log(data);
      const locationTableBaseId = 'appcEQn2WS81uwQbY';
      const headers = {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      };
      const addedPost = await fetch(
        `https://api.airtable.com/v0/${locationTableBaseId}/${encodeURIComponent(
          'locations-table'
        )}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ fields: data }),
          mode: 'no-cors',
        }
      )
        .then((resp) => resp.json())
        .then((data) => data);

      console.log(addedPost);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'post successfully added',
          payLoad: data,
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error' }),
      };
    }
  }
};
