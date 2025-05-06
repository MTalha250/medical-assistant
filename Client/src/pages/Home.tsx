import { Outlet } from "react-router-dom";
import gif from "@/assets/gif.mp4";
const Home = () => {
  return (
    <div className="p-4 md:p-8 w-full h-screen bg-gray-900">
      <div className="overflow-hidden w-full flex rounded-xl h-full border border-gray-700">
        <div className="px-8  hidden md:flex flex-col justify-center space-y-10 items-center h-full w-1/2 bg-[#1E2836] border-r border-gray-700">
          <h1 className="font-bold text-4xl">AI Medical Assistant</h1>
          <video src={gif} autoPlay loop muted className="w-60" />
          <p className="font-extralight">
            An AI assistant that provides everything you need to know about
            medical information. It is not a substitute for professional medical
            advice, diagnosis, or treatment. Always consult with a qualified
            healthcare provider for medical concerns.
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
