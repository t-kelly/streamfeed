import User from './user'
import Link from 'next/link'


export default function Header({ children }) {
  return (
    <header className="text-gray-100 bg-gray-900 body-font items-center">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link href="/">
          <a className="flex order-first lg:w-1/5 title-font font-medium items-center">
            StreamFeed
          </a>
        </Link>
        
        <div className="md:w-4/5 inline-flex md:justify-end ml-5 lg:ml-0">
          <User />
        </div>
      </div>
    </header>
  )
}