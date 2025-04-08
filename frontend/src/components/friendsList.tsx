import React, { useState } from "react";


const FriendsList: React.FC = () => {
	
	const [visibleState, changeState] = useState(false);
	
	const toggleState = () => {
		changeState(prevState => !prevState);
	};

	return (
		<div>
			<button onClick={toggleState}>
				{visibleState ? "Close" : "Frineds"}
			</button>
			<div
        style={{
          position: "fixed",
          top: 128,
          right: visibleState ? 0 : "-250px", // Slide in/out based on the visibility state
          width: "250px",
          height: "100%",
          backgroundColor: "lightgray",
          transition: "right 0.5s ease",
        }}></div>
		</div>
	  );
}

export default FriendsList;