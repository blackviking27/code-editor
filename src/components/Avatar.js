import Avvvatars from "avvvatars-react"

const Avatar = ({ client }) => {
    return (
        <div className="flex flex-col justify-center items-center" >
            <Avvvatars
                value={client.username}
                style="character"
                size={42}
            />
            <p className="mt-2 text-gray-300" >{client.username}</p>
        </div>
    )
}

export default Avatar