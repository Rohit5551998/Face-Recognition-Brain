import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, box, boxes }) => {

    let boxframes = boxes.map((box) => {
        return (
            <div
                key={box.index}
                className="bounding-box"
                style={{ top: box.topRow, right: box.rightCol, left: box.leftCol, bottom: box.bottomRow }}>
            </div>
        );
    })

    if (boxes.length > 0) {
        return (
            <div className="center ma">
                <div className="absolute mt2">
                    <img id='inputImage' src={imageUrl} alt=" " width="500px" height="auto" />
                    {boxframes}
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="center ma">
                <div className="absolute mt2">
                    <img id='inputImage' src={imageUrl} alt=" " width="500px" height="auto" />
                    <div className="bounding-box" style={{ top: box.topRow, right: box.rightCol, left: box.leftCol, bottom: box.bottomRow }}></div>
                </div>
            </div>
        );
    }
}

export default FaceRecognition;