import { request } from "./request";

export const addRuleCollections = async (data: any) => {
  return await request('/collections/add', 'post', data);
}