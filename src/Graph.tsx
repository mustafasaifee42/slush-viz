import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import GraphAnimate from './GraphAnimate';


export class GraphArea extends Component <{topics:any,sectors:any, data:any},{data:any,topics: any,value: any,sectors: any,sectorLength:number}> {
  public sectorIndx:number = 0
  public dataLen:number = 10
  constructor(props:any){  
    super(props)
    this.state = {  
      data: [],  
      topics: this.props.topics,
      value: ['Completely  agree','Somewhat agree','Neither agree or disagree','Somewhat disagree','Completely  disagree'],
      sectors: [],
      sectorLength:0,

    }  
    this.updateAPIData = this.updateAPIData.bind(this);  
  } 
  componentDidMount(){
    this.updateAPIData()
    setInterval(() => {this.updateAPIData()}, 60000);
  }
  updateAPIData(){
    axios.get('http://localhost:3000/typeform_response',{ headers: { Authorization: 'Bearer Hr3EEcXr52zkTRHrS4N2mTRk4SAZLAd3VwUnsoNbDCK9', "Access-Control-Allow-Origin": "*"} }).then(d => {
      let dat = d.data.items    
      let ans = dat.map((d:any,i:number) => {
        let answer = d.answers;
        let ansObj:any = {}
        for (let k  = 4; k < 9; k++){
          ansObj[this.props.topics[k-4]] = answer[k].number
        }
        ansObj['Sector'] = answer[3].text
        return ansObj
      })
      let freqData:any = {}
      let dataBySector = d3.nest()
        .key(function(d:any) { return d.Sector; })
        .entries(ans);
      let sectorAvg:any ={}
      let sect = ['All']
      dataBySector.forEach((el:any,i:number) => {
        sect.push(el.key)
        sectorAvg[el.key] = {'avg':{},data:el.values}
        this.state.topics.forEach((d:string, i:number) => {
          let landAvg = d3.mean(el.values, function(k:any) { return k[d]; });
          sectorAvg[el.key]['avg'][d] = landAvg
        })
      })
      sectorAvg['All'] = {'data':[],'avg':0}
      sectorAvg['All']['data'] = ans 
      let avg:any = {}
      this.state.topics.forEach((d:string, i:number) => {
        freqData[d] = {
          '1':0,
          '2':0,
          '3':0,
          '4':0,
          '5':0
        }
        let landAvg = d3.mean(ans, function(el:any) { return el[d]; });
        avg[d] = landAvg
      })
      sectorAvg['All']['avg'] = avg 
      sect.forEach((d:string,i:number) => {
        let frequency:any = {};
        this.state.topics.forEach((d1:string,i:number) => {
          freqData[d1] = {
            '1':0,
            '2':0,
            '3':0,
            '4':0,
            '5':0
          }
          var expensesCount = d3.nest()
            .key(function(k:any) { return k[d1]; })
            .rollup(function(v:any) { return v.length; })
            .entries(sectorAvg[d]['data']);
          let val = [
            { key: "1", value: 0 },
            { key: "2", value: 0 },
            { key: "3", value: 0 },
            { key: "4", value: 0 },
            { key: "5", value: 0 }
          ]
          expensesCount.forEach((element:any, l:number) => {
            val[parseInt(element.key) - 1].value = element.value
          })
            frequency[d1] = val
        })
        sectorAvg[d]['frequency'] = frequency
      })
      this.dataLen = ans.length;
      this.setState({
        data:sectorAvg,
        sectors:sect,
        sectorLength: sect.length,
      })
    })
  }
  render(){ 
    if(this.state.data.length === 0)
      return <div />
    else {
      return (
        <div className='svgContainer'>
          <GraphAnimate 
            data = {this.state.data}
            sectors = {this.state.sectors}
            topics = {this.state.topics}
            sectorLength={this.state.sectorLength}
            />
        </div>
      )
    }
  }  
}

export default GraphArea;

//Hr3EEcXr52zkTRHrS4N2mTRk4SAZLAd3VwUnsoNbDCK9

//MwDUbF