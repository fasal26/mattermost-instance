import { useEffect, useState } from 'react';
import './App.css'
// import { SideBar } from './components/SideBar'
import axios from 'axios';

function App() {

  const [ channels,setChannels ] = useState<any>([])
  const [ teams,setTeams ] = useState<any>([])
  const [ loader,setLoader ] = useState<boolean>(true)

  let  postCount = 0
  clctTtlPstCount()
  const baseUrl = "http://68.183.88.126:8065";
  const token = "7sacw7gn7b8xfx3wyeokrwqtfc";
  const userId = "kggwskrnatg48pusqf95sugatr";

  const headers = { "Authorization": `Bearer ${token}` };

  // getting the no.of teams of the user
  async function getUserTeams(userId: string) {
      const response = await axios.get(`${baseUrl}/api/v4/users/${userId}/teams`, { headers });
      return response.data;
  }

  // getting the no.of channels of the team
  async function getUserChannels(userId: string, teamId: string) {
      const response = await axios.get(`${baseUrl}/api/v4/users/${userId}/teams/${teamId}/channels`, { headers });
      return response.data.filter((_:any) => _.type == 'O'); // filtering out only user created posts
  }

  // getting the post of a specific channel
  async function getChannelPosts(channelId: string) {
      const response = await axios.get(`${baseUrl}/api/v4/channels/${channelId}/posts`, { headers });
      return response.data.posts;
  }

  async function countUserPosts() {
    let channelsArr = []
    for (const team of teams) {
      const channels = await getUserChannels(userId, team.id);
      for (const chnl of channels) {
        const posts = await getChannelPosts(chnl.id);
        const psts = Object.values(posts).filter((post: any) => post.user_id === userId && !['system_join_channel','system_join_team'].includes(post.type));
        chnl.postCount = psts?.length || 0
        channelsArr.push(chnl)
      }
    }
    setChannels(channelsArr)
  }

  function clctTtlPstCount(){
    if(channels?.length){
      for(let ch of channels){
        postCount += ch.postCount
      }
      loader && setLoader(false)
    }
  }


  useEffect(() => {
    countUserPosts()
  }, [teams])

  useEffect(() => {
    async function getTeams(){
      const teams = await getUserTeams(userId);
      setTeams(teams)
    }
    
    getTeams()
  }, [])
  

  return (
    <div className="parent">
      <div className="card-wrapper">
        {loader ? (
          "Loading..."
        ) : (
          <>
            <p>Hello Mattermost User,</p>
            <div className="items-container">
              <p>teams</p>
              {teams.map((t: any,i: number) => (
                <div className="items" key={i}>
                  <p>{t.display_name}</p>
                </div>
              ))}
            </div>
            <div className="items-container">
              <p>Channels</p>
              {channels.map((c: any,i: number) => (
                <div className="items" key={i}>
                  <p>{c.display_name}<span>{c.postCount} posts</span></p>
                </div>
              ))}
            </div>
            <div className="items-container">
              <p>Total no.of post by the user,</p>
              <div className="items">
                <p>{postCount} posts</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App
