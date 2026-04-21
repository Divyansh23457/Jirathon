import axios from 'axios';

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://triharder1303.atlassian.net/rest/api/3/issue/SCRUM-5',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Basic ZGl2eWFuc2guZHlAZ21haWwuY29tOkFUQVRUM3hGZkdGMEFvWHI0VHFfSmhWUHUxSmNianFVX0w5WmJRZHhCWk5waERYbnQ1LTEzNmx1V3AtX1lWZUN6bG11TW8xSG5HenBRWEpYbXdSMm9LTmlCcW9MX2ZPZ0pDX3BRSHVFYXFrcWlqSE9sNVhLM3hiN0RJRHE0UjVZUHNVQU94ZG5aRXMxMXp6QTdabnNmVmx0dF9KQS1FWm5xWmVMZjRaSW52REdWUHRkNXVMTjVSRT0yMDQyOUQ3Rg==', 
    'Cookie': 'atl-sticky-version={"currentVersion":"mrjf-prod-19497","currentVersionExpiry":"1776895198030"}; atlassian.xsrf.token=eebbf04d400cd6709d8d57ce78dcfdb2ea81f2f2_lin'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
