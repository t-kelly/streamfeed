export default function Message(props) {


  return (
    <section className="flex flex-col items-start">
      <div>
        <div className="bg-indigo-700 text-white text-xl px-6 py-4 mb-2 rounded-lg uppercase">
          <span className="text-2xl font-bold tracking-wider">{props.title}</span>
        </div>
      </div>
      <div className="bg-white text-3xl leading-normal p-6 w-2/3 rounded-lg">
        <span>{props.content}</span>
      </div>
    </section>
  )
}