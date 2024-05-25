import { useEffect, useState } from 'react';
import './App.css'
// import { SideBar } from './components/SideBar'
import axios from 'axios';

function App() {

  // const [ channels,setChannels ] = useState<any>([])
  const [ users,setUsers ] = useState<any>([])
  const [ teams,setTeams ] = useState<any>([])
  const [ loader,setLoader ] = useState<boolean>(true)
  const [ userPosts,setUserposts ] = useState<any>({})
  
  if(Object.values(userPosts)?.length) 
  loader && setLoader(false)

  // let  postCount = 0
  // clctTtlPstCount()
  const baseUrl = "http://68.183.88.126:8065";
  const token = "7sacw7gn7b8xfx3wyeokrwqtfc";
  const userId = "kggwskrnatg48pusqf95sugatr";

  const headers = { "Authorization": `Bearer ${token}` };

  async function getUsers() {
    const response = await axios.get(`${baseUrl}/api/v4/users`, { headers })
    setUsers(response.data)
  }

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
    // let channelsArr = []
    let usrPsts: any = {}
    for (const team of teams) {
      const channels = await getUserChannels(userId, team.id);
      for (const chnl of channels) {
        const posts = await getChannelPosts(chnl.id);
        for(let [_key,value] of Object.entries(posts)){
          const v = value as any
          if(!usrPsts[v.user_id]) usrPsts[v.user_id] = 1
          else usrPsts[v.user_id] += 1
        }
        // const psts = Object.values(posts).filter((post: any) => post.user_id === userId && !['system_join_channel','system_join_team'].includes(post.type));
        // chnl.postCount = posts?.length || 0
        // channelsArr.push(chnl)
      }
    }
    setUserposts({
      ...userPosts,
      ...usrPsts
    })
    // setChannels(channelsArr)
  }

  // function clctTtlPstCount(){
  //   if(channels?.length){
  //     for(let ch of channels){
  //       postCount += ch.postCount
  //     }
  //     loader && setLoader(false)
  //   }
  // }

  useEffect(() => {
    countUserPosts()
  }, [teams])

  useEffect(() => {
    // sorting the users array with highest to lowest
    const userScoresArray: any = Object.entries(userPosts);
    userScoresArray.sort(([, valueA] : any, [, valueB]: any) => valueB - valueA);
    const userMap = new Map(users.map((user: any) => [user.id, user]));
    const sortedUsers = userScoresArray.map(([userId]: any) => userMap.get(userId));
    const usersWithoutPosts = []
    for(let uwp of users){
      if(!userPosts[uwp.id]) usersWithoutPosts.push(uwp)
    }
    let finalUsers = [
      ...sortedUsers,
      ...usersWithoutPosts
    ]
    setUsers(finalUsers)
  }, [userPosts])

  useEffect(() => {
    async function getTeams(){
      const teams = await getUserTeams(userId);
      setTeams(teams)
    }
    
    getUsers()
    getTeams()
  }, [])
  

  return (
    <div className="parent">
      {/* <div className="card-wrapper">
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
      </div> */}
      {loader ? (
        "Loading..."
      ) : (
        <div className="card">
          <div className="card-item green">User email</div>
          <div className="card-item green">Posts</div>
          {users.map((usr: any) => (
            <>
              <div className="card-item">{usr.email}</div>
              <div className="card-item">{userPosts?.[usr.id] || 0}</div>
            </>
          ))}
        </div>
      )}
    </div>
  );
}

export default App
