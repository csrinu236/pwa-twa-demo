exports.handler = async (ev, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      name: 'sreenu',
      age: 23,
      role: 'Developer',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
