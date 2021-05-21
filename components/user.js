import { signIn, signOut, useSession} from 'next-auth/client'

export default function User() {
  const [session, loading ] = useSession();

  return (
    <>
      {!session && <>
        <button 
          className="bg-indigo-700 hover:bg-indigo-500 text-white ml-4 py-2 px-3 rounded-lg"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      </>}

      {session && <>
        <span
          className="px-3 py-2 ml-4"
        >
          Signed in as {session.user.email} <br/>
        </span>
        <button 
          className="bg-indigo-700 hover:bg-indigo-500 text-white ml-4 py-2 px-3 rounded-lg"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </>}
    </>
  )
}