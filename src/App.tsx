import React, { useEffect, useState } from 'react'

import {
  AgoraVideoPlayer,
  ClientConfig,
  createClient,
  createMicrophoneAndCameraTracks,
  IAgoraRTCRemoteUser
} from 'agora-rtc-react'

const config: ClientConfig = { mode: 'rtc', codec: 'vp8' }
const agoraSettings = {
  appId: 'b3f27bd25e45499d8f7efd96fe92314a',
  token:
    '006b3f27bd25e45499d8f7efd96fe92314aIACeos6OmvpDkoAgLS2EYZgo8tyXKsLaa4QDKhEcPTO1xgx+f9gAAAAAEACLgpZh+dknYQEAAQD52Sdh',
  channel: 'test'
}

const useClient = createClient(config)
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks()

const App: React.FC = () => {
  const client = useClient()
  const { ready, tracks } = useMicrophoneAndCameraTracks()
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [start, setStart] = useState<boolean>(false)

  useEffect(() => {
    // function to initialise the SDK
    let init = async (name: string) => {
      console.log('init', name)
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType)
        console.log('subscribe success')
        if (mediaType === 'video') {
          setUsers(prevUsers => {
            return [...prevUsers, user]
          })
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }
      })

      client.on('user-unpublished', (user, type) => {
        console.log('unpublished', user, type)
        if (type === 'audio') {
          user.audioTrack?.stop()
        }
        if (type === 'video') {
          setUsers(prevUsers => {
            return prevUsers.filter(User => User.uid !== user.uid)
          })
        }
      })

      client.on('user-left', user => {
        console.log('leaving', user)
        setUsers(prevUsers => {
          return prevUsers.filter(User => User.uid !== user.uid)
        })
      })

      await client.join(agoraSettings.appId, name, agoraSettings.token, null)
      if (tracks) await client.publish([tracks[0], tracks[1]])
      setStart(true)
    }

    if (ready && tracks) {
      console.log('init ready')
      init(agoraSettings.channel)
    }
  }, [agoraSettings.channel, client, ready, tracks])

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-800">
      <div className="w-6/12 grid-cols-2 p-8 bg-gray-600 rounded-sm">
        <div>
          <p>Local video feed</p>
          {tracks && tracks.length > 0 && (
            <AgoraVideoPlayer
              videoTrack={tracks[1]}
              className="rounded-full h-15 w-15"
              style={{ height: 100, width: 100 }}
            />
          )}
        </div>
        <div className="grid-cols-2 gap-3">
          {users.map((user: IAgoraRTCRemoteUser) => (
            <div key={user.uid}>
              {user.videoTrack && (
                <AgoraVideoPlayer
                  className="bg-red-200 h-15 w-15"
                  videoTrack={user.videoTrack}
                  style={{ height: 100, width: 100 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default App
