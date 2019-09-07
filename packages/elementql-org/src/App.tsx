import React from 'react';
import './App.css';
import elementQLMark from './assets/elementql-mark.png';
import githubLogo from './assets/github-logo.png';



const App: React.FC = () => {
    return (
        <div className="App">
            <div className="ElementQLMark">
                <img src={elementQLMark} height={250} alt="elementql" />
            </div>

            <div className="ElementQL">
                <span className="Element">Element</span>
                <span className="QL">QL</span>

                <span className="Link">
                    <a
                        href="https://github.com/plurid/elementql"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src={githubLogo} height={28} alt="github" />
                    </a>
                </span>
            </div>
        </div>
    );
}


export default App;
