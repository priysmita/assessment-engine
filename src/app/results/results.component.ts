import { Component, OnInit, ViewChild, ElementRef, VERSION, Input } from '@angular/core';

import { QuizService } from '../services/quiz.service';
import { HelperService } from '../services/helper.service';
import { Option, Question, Quiz, QuizConfig } from '../models/index';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import * as  Highcharts from 'highcharts';
import More from 'highcharts/highcharts-more';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
// Load the exporting module.
import Exporting from 'highcharts/modules/exporting';
// Initialize exporting module.
Exporting(Highcharts);

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  providers: [QuizService]
})
export class ResultsComponent implements OnInit {
  @ViewChild("container", { read: ElementRef }) container: ElementRef;

  @Input('answered') answer: any[];
  @Input('answeredPercentage') answeredPercentage: number;
  @Input('skippedPercentage') skippedPercentage: number;
  @Input('quizName') quizName: string;
  @Input('correctAnswered') correctAnswered: number;
  @Input('UncorrectAnswered') UncorrectAnswered: number;
  

  fullArray: any[] = [];
  categoryOne: any[];
  categoryTwo: any[];
  categoryThree: any[];
  categoryFour: any[];
  categoryIds: string[] = [];

  constructor(private quizService: QuizService) { }

  ngOnInit() {
    this.answer.forEach(question => {
      this.categoryIds.push(question.categoryId);
    });
    function group(arr, key) {
      return [arr.reduce( (acc, o) => 
          acc.set(o[key], (acc.get(o[key]) || []).concat(o))
      , new Map)];
    }
  const result = group(this.answer, 'categoryId');
  result.map((val) => {
    (this.categoryIds.reduce((unique, item) => 
    unique.includes(item) ? unique : [...unique, item], [])).forEach((categoryName) => {
      const dataArray = [categoryName, val.get(categoryName).length];
      if (categoryName === 'JavaScript Quiz') {
        this.categoryOne = dataArray;
      }
      if (categoryName === 'Asp.Net Quiz') {
        this.categoryTwo = dataArray;
      }
      if (categoryName === 'C# and .Net Framework') {
        this.categoryThree = dataArray;
      }
      if (categoryName === 'Design Patterns') {
        this.categoryFour =  dataArray;
      }
    });
  })

  this.answer.forEach(question => {
    this.categoryIds.push(question.categoryId);
  });

    Highcharts.chart(this.container.nativeElement, {
      // Created pie chart using Highchart
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45
        }
      },
      title: {
        text: 'Contents using Pie chart'
      },
      subtitle: {
        text: '3D donut in Highcharts'
      },
      plotOptions: {
        pie: {
          innerSize: 100,
          depth: 45
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
      },
       series: [{
            name: 'Total Questions',
            colorByPoint: true,
            data: [{
                name: 'Answered',
                y: this.answeredPercentage,
                drilldown: 'answered'
            },
            {
              name: 'Skipped',
              y: this.skippedPercentage,
              drilldown: 'skipped'
            }
          ]
        }],
        drilldown: {
            series: [{
                id: 'answered',
                name: 'answered',
                data: [
                    {name: 'JavaScript Quiz', 
                     y: 2,
                     drilldown: 'JavaScript Quiz'},
                     this.categoryOne,
                     this.categoryTwo,
                     this.categoryThree,
                     this.categoryFour
                ]
            }, 
            {
                
                id:'JavaScript Quiz',
                data: [
                  ['correct', this.correctAnswered / this.answer.length * 100],
                  ['Uncorret', this.UncorrectAnswered / this.answer.length * 100]
                ] 
            }
          ]
        }
    })
  }
}
