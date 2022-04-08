import axios from 'axios';

const endpoint = 'https://healthmonitor5.herokuapp.com';

export const logoutPrev = async () => {
  console.log('hello api');
  const res = await axios.post(endpoint + '/logout');
  return res;
};
