import { useEffect, useState } from 'react';
import './App.css'
// import { SideBar } from './components/SideBar'
import axios from 'axios';

function App() {

  const [ postCount,setPostCount ] = useState(0)
  const [ channels,setChannels ] = useState<any>([])
  const [ teams,setTeams ] = useState<any>([])
  const [ loader,setLoader ] = useState<boolean>(true)

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

  async function countUserPosts(userId: string) {
    const teams = await getUserTeams(userId);
    let userPostsCount = 0;
    let channelsArr = []
    setTeams(teams)
    for (const team of teams) {
        const channels = await getUserChannels(userId, team.id);
        channelsArr = channels
        for (const channel of channels) {
            const posts = await getChannelPosts(channel.id);
            console.log(posts,'posts');
            
            const userPosts = Object.values(posts).filter((post: any) => post.user_id === userId && post.type != 'system_join_team');
            userPostsCount += userPosts.length;
        }
    }
    setChannels(channelsArr)
    return userPostsCount - 1;
  }


  useEffect(() => {
    countUserPosts(userId).then(count => {
      setPostCount(count)
      setLoader(false)
    }).catch(error => {
      console.log(error);
    });
    
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
              {teams.map((t: any) => (
                <div className="items">
                  <p>{t.display_name}</p>
                </div>
              ))}
            </div>
            <div className="items-container">
              <p>Channels</p>
              {channels.map((c: any) => (
                <div className="items">
                  <p>{c.display_name}</p>
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
