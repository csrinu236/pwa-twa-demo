const fs = require('fs/promises');

/**
 * This functions stops the control for the specified desire time
 * @param {number} time
 * @returns {Promise<null>}
 */
const awaiter = (time) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });

const getData = async () => {
  let data = null;
  try {
    data = await fs.readFile(process.cwd() + '/db.txt', {
      encoding: 'utf8',
    });
    await awaiter(1000);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
  return data;
};

/**
 * sends post to database
 * @param {string} body
 * @returns {null}
 */
const postData = async (body) => {
  try {
    const content = JSON.parse(body);
    const dbList = await getData().then((data) => JSON.parse(data));
    dbList.push(content);
    return await fs.writeFile(
      process.cwd() + '/db.txt',
      JSON.stringify(dbList)
    );
  } catch (err) {
    console.error('Err0r', err);
    throw new Error(err);
  }
};

exports.handler = async (ev, context) => {
  // console.log(JSON.parse(ev.body));

  if (ev.httpMethod === 'GET') {
    try {
      const data = await getData();
      return {
        statusCode: 200,
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'something went wrong', error }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  if (ev.httpMethod === 'POST') {
    try {
      await postData(ev.body);
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'post added successfully',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal Server Error',
          error,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     name: 'sreenu',
  //     age: 23,
  //     role: 'Developer',
  //     method: ev.httpMethod,
  //     // data,
  //   }),
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // };
};
