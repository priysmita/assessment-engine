import { Component, OnInit } from '@angular/core';

import { QuizService } from '../services/quiz.service';
import { HelperService } from '../services/helper.service';
import { Option, Question, Quiz, QuizConfig } from '../models/index';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  providers: [QuizService]
})
export class QuizComponent implements OnInit {
  quizes: any[];
  quiz: Quiz = new Quiz(null);
  mode = 'quiz';
  optionSelected: string;
  quizName: string;
  isSubmitButtonEnabled: boolean
  answers: any[];
  answered: any;
  skipped: any[];
  corrected: any[];
  answeredPercentage: number;
  skippedPercentage: number;
  scoredPercentage: number;
  scoredPercentageFromAnsweredQuestions: number;
  totalAnsweredQuestion: any[] = [];
  totalSkippedQuestion: any[] = [];
  totalQuestion: any[] = [];
  percentile = ' %';
  totalAnsweredPercentage: number;
  totalSkippedPercentage: number;
  wrongAnswered: number;
  config: QuizConfig = {
    'allowBack': true,
    'allowReview': true,
    'autoMove': false,  // if true, it will move to next question automatically when answered.
    'duration': 300,  // indicates the time (in secs) in which quiz needs to be completed. 0 means unlimited.
    'pageSize': 1,
    'requiredAll': false,  // indicates if you must answer all the questions before submitting.
    'richText': false,
    'shuffleQuestions': false,
    'shuffleOptions': false,
    'showClock': false,
    'showPager': true,
    'theme': 'none'
  };

  pager = {
    index: 0,
    size: 1,
    count: 1
  };
  timer: any = null;
  startTime: Date;
  endTime: Date;
  ellapsedTime = '00:00';
  duration = '';

  constructor(private quizService: QuizService) { }

  ngOnInit() {
    this.quizes = this.quizService.getAll();
    this.quizName = this.quizes[0].id;
    console.log('this.answered', this.answered);
    this.loadQuiz(this.quizName);
    this.optionSelected = 'Not Answered';
    this.isSubmitButtonEnabled = false;
  }

  loadQuiz = (quizName: string) => {
    this.quizService.get(quizName).subscribe(res => {
      this.quiz = new Quiz(res);
      this.pager.count = this.quiz.questions.length;
      this.pager.index = 0;
      console.log('Load Quiz');
      this.startTime = new Date();
      this.ellapsedTime = '00:00';
      this.timer = setInterval(() => { this.tick(); }, 1000);
      this.duration = this.parseTime(this.config.duration);
    });
    this.mode = 'quiz';
  }

  tick() {
    const now = new Date();
    const diff = (now.getTime() - this.startTime.getTime()) / 1000;
    if (diff >= this.config.duration) {
      this.onSubmit();
    }
    this.ellapsedTime = this.parseTime(diff);
  }

  parseTime(totalSeconds: number) {
    let mins: string | number = Math.floor(totalSeconds / 60);
    let secs: string | number = Math.round(totalSeconds % 60);
    mins = (mins < 10 ? '0' : '') + mins;
    secs = (secs < 10 ? '0' : '') + secs;
    return `${mins}:${secs}`;
  }
  get filteredQuestions() {
    return (this.quiz.questions) ?
    this.quiz.questions.slice(this.pager.index, this.pager.index + this.pager.size) : [];
  }

  onSelect = (question: Question, option: Option) => {
    if (question.questionTypeId === 1) {
      question.options.forEach((x) => { if (x.id !== option.id) x.selected = false; });
      this.optionSelected = this.isAnswered(question);
    }

    if (this.config.autoMove) {
      this.goTo(this.pager.index + 1);
    }
  }

  goTo = (index: number) => {
    if (index >= 0 && index < this.pager.count) {
      this.optionSelected = this.isAnswered(this.quiz.questions[index]);
      this.isSubmitButtonEnabled = this.quiz.questions.length === index + 1;
      this.pager.index = index;
      this.mode = 'quiz';
    }
  }

  isAnswered = (question: Question) => {
    return question.options.find(x => x.selected) ? 'Answered' : 'Not Answered';
  }

  isCorrect = (question: Question) => {
    return question.options.every(x => x.selected === x.isAnswer && x.categoryId === 1) ? 'correct' : 'wrong';
  }
  onSubmit = () => {
  this.quiz.questions.map(question => {
    question.options.map(option => {
      return Object.assign(option, {categoryId: this.quiz.id});
  })});
  this.quiz.questions.map(question => {
      return Object.assign(question, {categoryId: this.quiz.name});
  });
    this.answered = this.quiz.questions.filter(x => {
    return this.isAnswered(x) === 'Answered'
    });
    this.skipped = this.quiz.questions.filter(x => {
      return this.isAnswered(x) === 'Not Answered'
    });
    this.corrected = this.answered.filter(x => {
      return this.isCorrect(x) === 'correct'
    });
    for(const obj of this.answered) {
      this.totalAnsweredQuestion.push(obj);
    }
    for(const obj of this.skipped) {
      this.totalSkippedQuestion.push(obj);
    }
    for(const obj of this.quiz.questions) {
      this.totalQuestion.push(obj);
    }
    this.wrongAnswered = this.answered.length - this.corrected.length;
    this.scoredPercentage = this.corrected.length / this.quiz.questions.length * 100;
    this.answeredPercentage = this.answered.length / this.quiz.questions.length * 100;
    this.skippedPercentage = this.skipped.length / this.quiz.questions.length * 100;
    this.scoredPercentageFromAnsweredQuestions = this.corrected.length/ (this.quiz.questions.length - this.skipped.length) * 100;
    this.totalAnsweredPercentage = this.totalAnsweredQuestion.length / this.totalQuestion.length * 100;
    this.totalSkippedPercentage = this.totalSkippedQuestion.length / this.totalQuestion.length * 100;
    alert('Some of the questions has skipped, please re-visit to attend the same or click on ok to continue')
    this.mode = 'result';
  }
}
