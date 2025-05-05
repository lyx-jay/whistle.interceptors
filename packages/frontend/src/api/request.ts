import axios from 'axios';
const BASE_RUL = '/whistle.interceptors'

const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 封装一个请求方法
export const request = async (url: string, method: 'get' | 'post' | 'put' | 'delete', data?: any) => {
  const response = await instance({
    url: BASE_RUL + url,
    method,
    data,
  });
  return response.data;
};


