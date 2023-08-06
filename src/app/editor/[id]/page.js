"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { langs } from '@uiw/codemirror-extensions-langs'
import { initSocket } from '@/utils/socket'
import Actions from '@/utils/actions'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Toaster, toast } from 'react-hot-toast'
import Avatar from '@/components/Avatar'
import {
    abcdef,
    atomone,
    dracula,
    githubLight,
    githubDark,
    eclipse,
    materialLight,
    materialDark
} from '@uiw/codemirror-themes-all'

const EditorPage = () => {

    const router = useRouter()
    const { id: roomId } = useParams()
    const params = useSearchParams()
    const socketRef = useRef(null)
    const [clients, setClients] = useState([])
    // const [codeVal, setCodeVal] = useState('')
    const editorRef = useRef()

    const [lang, setLang] = useState("")
    const [theme, setTheme] = useState("")

    const codingLangs = {
        "Python": langs.python(),
        "C++": langs.cpp(),
        "Java": langs.java(),
        "Golang": langs.go(),
        "JavaScript": langs.javascript()
    }

    const editorThemes = {
        "abcdef": abcdef,
        "Atomone": atomone,
        "Dracula": dracula,
        "Github Light": githubLight,
        "Github Dark": githubDark,
        "Eclipse": eclipse,
        "Material Light": materialLight,
        "Material Dark": materialDark

    }

    const handleSocketErr = (err) => {
        console.log("Socket error", err)
        toast.error("Socket connection failed, try again later")
        router.push("/")
    }

    useEffect(() => {
        setLang(langs.python())
        setTheme(abcdef)
        if (params.get("user") && roomId) {
            const currUser = params.get("user")
            const init = async () => {
                socketRef.current = await initSocket()

                // handling socket error
                socketRef.current.on('connect_error', (err) => handleSocketErr(err))
                socketRef.current.on('connect_failed', (err) => handleSocketErr(err))

                // on joining a new room
                socketRef.current.emit(Actions.JOIN, {
                    roomId,
                    username: currUser || "default_name"
                })

                // when a new user joins the room
                socketRef.current.on(Actions.JOINED, ({ clients, username, socketId }) => {
                    if (username !== currUser) {
                        toast.success(`${username} joined`)
                    }
                    setClients(clients)
                    // syncing the code with others
                    socketRef.current.emit(Actions.SYNC_CODE, {
                        code: editorRef.current.view.state.doc.toString(),
                        socketId: socketId
                    })
                })

                // when a user disconnets from the room
                socketRef.current.on(Actions.DISCONNECTED, ({ socketId, username }) => {
                    toast.success(`${username} left the room`)
                    setClients((prev) => {
                        return prev.filter(client => client.socketId != socketId)
                    })
                })

                // listening for code change from others
                socketRef.current.on(Actions.CODE_CHANGE, ({ code }) => {
                    if (code !== null) {
                        editorRef.current?.view?.dispatch({
                            changes: { from: 0, to: editorRef.current.view.viewState.state.doc.length, insert: code },
                            userEvent: "dispatch"
                        })
                    }
                })

            }
            init()
        } else {
            router.push("/")
        }

        // unmounting
        return () => {
            socketRef.current.off(Actions.JOINED)
            socketRef.current.off(Actions.DISCONNECTED)
            socketRef.current.off(Actions.CODE_CHANGE)
            socketRef.current.off(Actions.SYNC_CODE)
            socketRef.current.disconnect()
        }
    }, [])

    const handleCodeChange = (e, changes) => {
        //sendng updated code
        // view.inputState.lastSelectionOrigin
        // console.log(editorRef.current.view.state.doc.toString())
        if (changes?.transactions[0]?.annotations[0]?.value !== "dispatch")
            socketRef?.current?.emit(Actions.CODE_CHANGE, {
                roomId,
                code: e
            })
    }

    const refCallBack = (e) => {
        if (!editorRef.current && e?.editor && e?.state && e?.view)
            editorRef.current = e
    }

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId)
        toast.success("Copied room id!")
    }

    const leaveRoom = () => {
        router.push("/")
    }

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="flex flex-col justify-between my-8 px-4">
                <div className='flex-grow overflow-y-auto' >
                    <Toaster />
                    <p className='text-center mb-6 font text-l' >Collaborators</p>
                    <div className='flex flex-wrap gap-4' >
                        {clients.map((client, idx) => (
                            <Avatar key={idx} client={client} />
                        ))}
                    </div>
                </div>
                <div className='w-full gap-2 flex flex-col' >
                    <button className='bg-[#22C55E] px-2 py-4 rounded-lg text-black w-full text-sm hover:bg-[#22C55E]/75 transition-all ease-in hover:text-white/75' onClick={copyRoomId} >Copy Id</button>
                    <button className='bg-red-400 px-2 py-4 rounded-lg text-black w-full text-sm hover:bg-red-800 transition-all ease-in hover:text-white/75' onClick={leaveRoom} >Leave</button>
                </div>
            </div>
            <div className='flex-grow my-8 px-4' >
                <div className='flex gap-4' >
                    <div>
                        <label className='mr-3' >Language:</label>
                        <select className='bg-gray-800 py-2 px-4 rounded-lg' onChange={e => setLang(codingLangs[e.target.value])}  >
                            {
                                Object.keys(codingLangs).map((name) => (
                                    <option key={name}>{name}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div>
                        <label className='mr-3' >Theme:</label>
                        <select className='bg-gray-800 py-2 px-4 rounded-lg' onChange={e => setTheme(editorThemes[e.target.value])} >
                            {
                                Object.keys(editorThemes).map((data, idx) => (
                                    <option>{data}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <CodeMirror className='rounded-md mt-5 overflow-y-auto' width='100%' height='80vh' theme={theme} extensions={[lang]} ref={refCallBack} onChange={(e, c) => handleCodeChange(e, c)} />
            </div>
        </div>
    )
}

export default EditorPage