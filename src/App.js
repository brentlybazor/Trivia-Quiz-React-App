import React, { useState } from 'react';
import axios from 'axios'
import { useForm } from "react-hook-form";

export default function App() {

	const { register, handleSubmit } = useForm();

	const [questions, setQuestions] = useState(undefined);
	const [quizStarted, setQuizStarted] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [showScore, setShowScore] = useState(false);
	const [score, setScore] = useState(0);
	const [clickedAnswers, setClickedAnswers] = useState([]);
	const [reviewAnswers, setReviewAnswers] = useState(false);


	const handleAnswerOptionClick = (isCorrect, answerClicked, questionNumber) => {
		if (isCorrect) {
			setScore(score + 1);
		}

		setClickedAnswers(clickedAnswers.concat({ answer: answerClicked, questionNumber: questionNumber }))

		const nextQuestion = currentQuestion + 1;
		if (nextQuestion < questions.length) {
			setCurrentQuestion(nextQuestion);
		} else {
			setShowScore(true);
		}
	};

	const formatQuestionReturnData = (inputData) => {

		function shuffle(array) {
			return array.sort(() => Math.random() - 0.5);
		}

		function formattedAnswers(answersInput, allData) {

			if (allData.type !== 'boolean') {
				answersInput = shuffle(answersInput)
			} else {
				return [
					{ answerText: 'True', isCorrect: 'True' === allData.correct_answer ? true : false },
					{ answerText: 'False', isCorrect: 'False' === allData.correct_answer ? true : false }
				]
			}

			return answersInput.map((answer) => {
				return { answerText: htmlEntities(answer), isCorrect: answer === allData.correct_answer ? true : false }
			})
		}

		let questionData = inputData.map((data) => {
			let answers = [data.correct_answer, ...data.incorrect_answers]

			answers = formattedAnswers(answers, data)

			return { ...data, question: htmlEntities(data.question), answerOptions: answers }
		})

		return questionData
	}

	const handelGetQuestions = async data => {
		const { numberOfQuestions, questionType, questionDifficulty } = data;
		setQuizStarted(true)

		// setQuestions(formatQuestionReturnData(questions2))
		// return

		let questionsAPIUrl = `https://opentdb.com/api.php?`

		if (numberOfQuestions) {
			questionsAPIUrl = questionsAPIUrl + `&amount=${numberOfQuestions}`
		}

		if (questionType) {
			questionsAPIUrl = questionsAPIUrl + `&type=${questionType}`
		}

		if(questionDifficulty) { 
			questionsAPIUrl = questionsAPIUrl + `&difficulty=${questionDifficulty}`
		}

		console.log(questionsAPIUrl);

		await axios.get(questionsAPIUrl)
			.then(res => {
				let questionData = formatQuestionReturnData(res.data.results)
				setQuestions(questionData)

			})
			.catch(err => {
				console.log(err);
			})

	};

	function htmlEntities(str) {
		let newString = String(str)
			.replace(/&amp;/g, `&`)
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, `'`)
			.replace(/&#039;/g, `'`)
			.replace(/&deg;/g, `\u00B0`)
			.replace(/&prime;/g, `'`)

			
		return newString;

	}

	const finishQuiz = () => {
		setQuizStarted(false);
		setScore(0);
		setQuestions(undefined);
		setShowScore(false);
		setClickedAnswers([])
		setReviewAnswers(false)
		setCurrentQuestion(0)
	}
	return (
		<div className='app'>
			{(questions === undefined || !quizStarted) ? (
				<div className='menu-section'>
					Cool Quiz
					{/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
					<form onSubmit={handleSubmit(handelGetQuestions)}>
						{/* register your input into the hook by invoking the "register" function */}
						<label>Number of Questions</label>
						<input name={'numberOfQuestions'} defaultValue={10} ref={register} />

						<label>Type of Questions</label>
						<select name="questionType" id="questionType" ref={register}>
							<option value="">Any Type</option>
							<option value="multiple">Multiple Choice</option>
							<option value="boolean">True/False</option>
						</select>

						<label>Type of Category</label>
						<select name="trivia_category" className="form-control" ref={register}>
							<option value="any">Any Category</option>
							<option value="9">General Knowledge</option>
							<option value="10">Entertainment: Books</option>
							<option value="11">Entertainment: Film</option>
							<option value="12">Entertainment: Music</option>
							<option value="13">Entertainment: Musicals &amp; Theatres</option>
							<option value="14">Entertainment: Television</option>
							<option value="15">Entertainment: Video Games</option>
							<option value="16">Entertainment: Board Games</option>
							<option value="17">Science &amp; Nature</option>
							<option value="18">Science: Computers</option>
							<option value="19">Science: Mathematics</option>
							<option value="20">Mythology</option>
							<option value="21">Sports</option>
							<option value="22">Geography</option>
							<option value="23">History</option>
							<option value="24">Politics</option>
							<option value="25">Art</option>
							<option value="26">Celebrities</option>
							<option value="27">Animals</option>
							<option value="28">Vehicles</option>
							<option value="29">Entertainment: Comics</option>
							<option value="30">Science: Gadgets</option>
							<option value="31">Entertainment: Japanese Anime &amp; Manga</option>
							<option value="32">Entertainment: Cartoon &amp; Animations</option>
						</select>

						<label>Question Difficulty</label>
						<select name="questionDifficulty" className="form-control" ref={register}>
							<option value="">Any Difficulty</option>
							<option value="easy">Easy</option>
							<option value="medium">Medium</option>
							<option value="hard">Hard</option>
						</select>
						{/* include validation with required or other standard HTML validation rules */}
						{/* <input name="exampleRequired" ref={register({ required: true })} /> */}
						{/* errors will return when field validation fails  */}
						{/* {errors.exampleRequired && <span>This field is required</span>} */}

						<input className={'centerButton'} type="submit" value="Start" />
					</form>
				</div>
			) : showScore ? (
				<div className='score-section'>
					<p>You scored {score} out of {questions.length}</p>
					<button className={'centerButton'} onClick={() => setReviewAnswers(!reviewAnswers)}>{reviewAnswers === false ? 'Review' : 'Hide'} Answers</button>
					<button className={'centerButton'} onClick={finishQuiz}>Back To Menu</button>
					{reviewAnswers &&
						clickedAnswers.map((ans) => (
							<div>
								<h5>{questions[ans.questionNumber].question}</h5>
								<p>You answered: {ans.answer}</p>
								<p>Correct answer: {questions[ans.questionNumber].correct_answer}</p>
							</div>
						))
					}
				</div>
			) : (
						<>
							<div className='question-section'>
								<div className='question-count'>
									<span>Question {currentQuestion + 1}</span>/{questions.length}
								</div>
								<div className='question-text'>{questions[currentQuestion].question}</div>
							</div>
							<div className='answer-section'>
								{questions[currentQuestion].answerOptions.map((answerOption) => (
									<button onClick={() => handleAnswerOptionClick(answerOption.isCorrect, answerOption.answerText, currentQuestion)}>{answerOption.answerText}</button>
								))}
							</div>
						</>
					)

			}

		</div>
	);
}
