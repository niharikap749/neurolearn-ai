import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {

  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [roadmap, setRoadmap] = useState("");

  const [file, setFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load notes on page load
  useEffect(() => {
    fetchNotes();
  }, []);

  // Generate roadmap
  const generateRoadmap = async () => {

    try {

      const response = await axios.post(
        "https://neurolearn-ai-6btb.onrender.com/generate-roadmap",
        {
          goal,
          duration,
          level
        }
      );

      setRoadmap(response.data.roadmap);

    } catch (error) {

      console.log(error);
      alert("Roadmap generation failed");

    }
  };

  // Upload notes
  const uploadNotes = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await axios.post(
        "https://neurolearn-ai-6btb.onrender.com/upload-notes",
        formData
      );

      setUploadedFileName(response.data.filename);
      alert("Upload successful!");

      fetchNotes();

    } catch (error) {

      console.log(error);
      alert("Upload failed");

    }
  };

  // Fetch notes
  const fetchNotes = async () => {

    try {

      const response = await axios.get(
        "https://neurolearn-ai-6btb.onrender.com/notes"
      );

      setNotes(response.data.notes);

    } catch (error) {

      console.log(error);

    }
  };

  // Summarize notes
  const summarizeNotes = async (filename) => {

    try {
  
      setSummaryLoading(true);
      setSummary("");
  
      const response = await axios.get(
        `https://neurolearn-ai-6btb.onrender.com/summarize/${filename}`
      );
  
      setSummary(response.data.summary);
  
    } catch (error) {
  
      console.log(error);
      alert("Summary generation failed");
  
    } finally {
  
      setSummaryLoading(false);
  
    }
  };

  // Generate quiz
  const generateQuiz = async (filename) => {

    try {
  
      setQuizLoading(true);
      setQuiz([]);
      setSelectedAnswers({});
      setScore(null);
      setShowResults(false);
  
      const response = await axios.get(
        `https://neurolearn-ai-6btb.onrender.com/quiz/${filename}`
      );
  
      setQuiz(response.data.quiz);
  
    } catch (error) {
  
      console.log(error);
      alert("Quiz generation failed");
  
    } finally {
  
      setQuizLoading(false);
  
    }
  };

  const selectAnswer = (questionIndex, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option,
    });
  };

  const submitQuiz = () => {
    let total = 0;
  
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        total++;
      }
    });
  
    setScore(total);
    setShowResults(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-10">

      {/* Title */}
      <h1
        className="text-6xl font-bold mb-12 text-center"
        style={{ fontFamily: "Space Grotesk" }}
      >
        NeuroLearn AI 🚀
      </h1>

      {/* Roadmap Generator */}
      <div className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 p-8 rounded-3xl shadow-2xl hover:border-purple-500/40 transition-all duration-300 max-w-3xl mx-auto">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Generate AI Roadmap 🧠
        </h2>

        <input
          type="text"
          placeholder="Learning Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full p-4 mb-4 rounded-2xl bg-zinc-800/70 border border-zinc-700 focus:border-purple-500 outline-none transition"
        />

        <input
          type="text"
          placeholder="Duration (e.g. 3 months)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-4 mb-4 rounded-2xl bg-zinc-800/70 border border-zinc-700 focus:border-purple-500 outline-none transition"
        />

        <input
          type="text"
          placeholder="Skill Level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-4 mb-6 rounded-2xl bg-zinc-800/70 border border-zinc-700 focus:border-purple-500 outline-none transition"
        />

        <div className="flex justify-center">
          <button
            onClick={generateRoadmap}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 hover:shadow-purple-500/30 transition-all duration-300"
          >
            Generate AI Roadmap
          </button>
        </div>

      </div>

      {/* Roadmap Result */}
      {roadmap && (
        <div className="mt-8 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto whitespace-pre-line">

          <h2 className="text-3xl font-bold mb-6 text-center">
            Your Roadmap ✨
          </h2>

          <div className="leading-8 text-zinc-200">
            {roadmap}
          </div>

        </div>
      )}

      {/* Upload Notes */}
      <div className="mt-10 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-3xl mx-auto">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Upload Study Notes 📄
        </h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />

        {file && (
          <p className="text-zinc-400 mb-4">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={uploadNotes}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
        >
          Upload Notes
        </button>

        {uploadedFileName && (
          <div className="mt-4 bg-green-900/30 border border-green-700 p-4 rounded-2xl">
            ✅ Uploaded:
            <span className="font-semibold ml-2">
              {uploadedFileName}
            </span>
          </div>
        )}

      </div>

      {/* Notes Library */}
      <div className="mt-10 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-3xl mx-auto">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Notes Library 📚
        </h2>

        {notes.length === 0 ? (
          <p className="text-zinc-400 text-center">
            No notes uploaded yet
          </p>
        ) : (
          notes.map((note, index) => (
            <div
              key={index}
              className="bg-zinc-800/70 border border-zinc-700 p-4 rounded-2xl mb-3 hover:border-purple-500/40 transition flex justify-between items-center"
            >
              <span>📄 {note}</span>

              <div className="flex gap-3">

                <button
                  onClick={() => summarizeNotes(note)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 rounded-xl text-sm hover:scale-105 transition"
                >
                  Summarize
                </button>

                <button
                  onClick={() => generateQuiz(note)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-xl text-sm hover:scale-105 transition"
                >
                  Quiz
                </button>

              </div>
            </div>
          ))
        )}

      </div>


      {summaryLoading && (
         <div className="mt-10 text-center text-zinc-400">
           Generating AI summary... 🧠
         </div>
      )}

      {quizLoading && (
         <div className="mt-10 text-center text-zinc-400">
           Generating AI quiz... 📝
         </div>
      )}


      {/* Summary Card */}
      {summary && (
        <div className="mt-10 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto">

          <h2 className="text-3xl font-bold mb-6 text-center">
            AI Summary 🧠
          </h2>

          <div className="whitespace-pre-line leading-8 text-zinc-200">
            {summary}
          </div>

        </div>
      )}

      {/* Quiz Card */}
{/* Quiz Card */}
{quiz.length > 0 && (
  <div className="mt-10 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto">

    <h2 className="text-3xl font-bold mb-6 text-center">
      Quiz Generator 📝
    </h2>

    {quiz.map((q, index) => (
      <div
        key={index}
        className="bg-zinc-800/70 p-5 rounded-2xl mb-6"
      >
        <h3 className="font-semibold mb-4 text-lg">
          Q{index + 1}. {q.question}
        </h3>

        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => selectAnswer(index, option)}
            className={`w-full text-left p-3 rounded-xl mb-2 transition ${
              selectedAnswers[index] === option
                ? "bg-purple-600"
                : "bg-zinc-700/50 hover:bg-zinc-700"
            }`}
          >
            {option}
          </button>
        ))}

        {showResults && (
          <div className="mt-3">
            {selectedAnswers[index] === q.answer ? (
              <p className="text-green-400 font-semibold">
                ✅ Correct
              </p>
            ) : (
              <div>
                <p className="text-red-400 font-semibold">
                  ❌ Incorrect
                </p>

                <p className="text-green-400 mt-1">
                  Correct Answer: {q.answer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    ))}

    <div className="text-center mt-8">
      <button
        onClick={submitQuiz}
        className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-2xl font-semibold transition"
      >
        Submit Quiz
      </button>
    </div>

    {score !== null && (
      <div className="mt-6 text-center">
        <h3 className="text-3xl font-bold text-green-400">
          Score: {score}/{quiz.length} 🎉
        </h3>
      </div>
    )}

  </div>
)}

    </div>
  );
}

export default Dashboard;