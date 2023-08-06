'use client'
import { Triangle } from 'react-loader-spinner'

const loading = () => {
    return (
        <div className='w-100 h-screen flex flex-col justify-center items-center'>
            <Triangle
                height="80"
                width="80"
                color='#22C55E'
                ariaLabel='loading'
            />
            <p className='text-lg mt-4 text-gray-300'>Loading...</p>
        </div>
    )
}

export default loading