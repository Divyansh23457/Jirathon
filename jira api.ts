const axios = require('axios');
let storyId = 'SCRUM-5';
let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: `https://triharder1303.atlassian.net/rest/api/3/issue/${storyId}?fields=summary,description,issuetype`,
  headers: { 
    'Accept': 'application/json', 
    'Authorization': `Bearer ${process.env.JIRA_API_KEY}`
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
