import Image from "next/image"

export default function MapSection() {
  return (
    <div className="relative h-[300px] rounded-xl overflow-hidden">
      <Image src="/placeholder.svg?height=300&width=500" alt="Map of Miagao" fill className="object-cover" />
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm">
        <button className="px-4 py-1.5 bg-white rounded-full text-sm shadow-lg">
          Subscribe to this sensor for alerts 🔔
        </button>
      </div>
    </div>
  )
}

