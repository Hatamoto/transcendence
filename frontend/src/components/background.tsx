const Background: React.FC = () => {
	return (
	  <div
		className="fixed inset-0 -z-10"
		style={{
		  backgroundImage: "url('https://images.steamusercontent.com/ugc/922543831008219144/3AD9FCC897208D9E0BB8E26247708BEAC66E259A/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false')",
		  backgroundSize: "cover",
		  backgroundPosition: "center",
		  backgroundRepeat: "no-repeat",
		  backgroundAttachment: "fixed",
		}}
	  ></div>
	);
  };
  
  export default Background;