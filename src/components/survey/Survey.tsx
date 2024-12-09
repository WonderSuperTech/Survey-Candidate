import './Survey.scss';
import img1 from './html/img/main_icon_1.svg';
import jsonData from './survey.json';
import { BiCheckDouble } from "react-icons/bi";
import './html/css/bootstrap.min.css';
import './html/css/style.scss';
import './html/css/vendors.css';
import './html/css/custom.css';
import 'react-toastify/dist/ReactToastify.css';

import { useState, useEffect } from 'react';
import SurveyGroup from './tabs/SurveyGroup';

interface ContentItem {
  id: number;
  heading: string;
  dataType: 'verticalRadio' | 'verticalCheckBox' | 'inputSmallNumber' | 'inputSmallText' | 'inputTextArea';
  dataTitle: string;
  dataSubTitle?: string; // Assuming this can also be optional
  required: boolean;
  dataContent: string[];
  requiredTrueValue?: string;
  lowerLimit?: string;
  upperLimit?: string;
  additionalData?: any;
}

interface Survey {
  id: number;
  title: string;
  content: ContentItem[];
}

type Surveys = Survey[];

interface SurveyPagesProps {}

export default function SurveyPages({}: SurveyPagesProps) {
  const [pageStatus, setPageStatus] = useState<number>(0);
  const [surveyData, setSurveyData] = useState<Surveys>([]);
  const [answerNumber, setAnswerNumber] = useState<number[]>(Array(surveyData.length).fill(0));
  const [answerContent, setAnswerContent] = useState<any[]>([]);
  const [totalErrors, setTotalErrors] = useState<string[]>([]);
  const [modalShowStatus, setModalShowStatus] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<boolean>(false);


  useEffect(() => {
    setSurveyData(jsonData as Surveys);
  }, []);

  useEffect(() => {
    setAnswerContent(Array.from({ length: surveyData.length }, () => []));
  }, [surveyData.length]);

  const prevBtnFunction = () => {
    setPageStatus(prev => Math.max(0, prev - 1)); // Prevent negative page status
  };

  const handleSetAnswerContent = (newValue: any, currentPageIndex: number, currentIndex: number, dataType: string) => {

    const pageItem = [...answerContent];

    const previousValue = pageItem[currentPageIndex]?.[currentIndex];

    if ( dataType === "verticalRadio" || dataType === "inputSmallText" || dataType === "inputSmallNumber" || dataType === "inputTextArea"){

      if(previousValue !== newValue) {
        if(previousValue === undefined){
          setAnswerNumber(prev => {
            const updatedAnswerNumber = [...prev];
            updatedAnswerNumber[currentPageIndex] = (updatedAnswerNumber[currentPageIndex] || 0) + 1;
            return updatedAnswerNumber;
          })
        }

        if (pageItem[currentPageIndex]) {
          pageItem[currentPageIndex] = [...pageItem[currentPageIndex]];
          pageItem[currentPageIndex][currentIndex] = newValue;
          setAnswerContent(pageItem);
        }
      }

    }
    else if (dataType === "verticalCheckBox"){

      const hasIncreasedCount = previousValue !== undefined && previousValue !== '';

      const itemIndex = parseInt(newValue);

      const existingValue = pageItem[currentPageIndex]?.[currentIndex] || '';

      const currentValues = existingValue.split(',').map((val:string) => val.trim()).filter((val:string) => val);

      if(!currentValues.includes(itemIndex.toString())){

        if (!hasIncreasedCount) {
          setAnswerNumber(prev => {
              const updatedAnswerNumber = [...prev];
              updatedAnswerNumber[currentPageIndex] = (updatedAnswerNumber[currentPageIndex] || 0) + 1;
              return updatedAnswerNumber;
          });
        }
        currentValues.push(itemIndex.toString());

      }
      else {
        const indexToRemove = currentValues.indexOf(itemIndex.toString());
        if(indexToRemove !== -1){
          currentValues.splice(indexToRemove, 1);
        }
      }

      const updatedValue = currentValues.join(',');

      if(pageItem[currentPageIndex]) {
        pageItem[currentPageIndex] = [...pageItem[currentPageIndex]];
        pageItem[currentPageIndex][currentIndex] = updatedValue;
        setAnswerContent(pageItem);
      }
      
      if(currentValues.length === 0){
        setAnswerNumber(prev => {
          const updatedAnswerNumber = [...prev];
          updatedAnswerNumber[currentPageIndex] = Math.max((updatedAnswerNumber[currentPageIndex] || 1) - 1, 0);
          return updatedAnswerNumber;
      });
      }
    }
    

    // console.log("------------------ | start | ----------------");
    // console.log("currentPageIndex : ", currentPageIndex);
    // console.log("currentIndex : ", currentIndex);
    // console.log("newValue : ", newValue);
    // console.log("pageItem : " , pageItem);
    // console.log("answerContent : ", answerContent);
    // console.log('answerNumber : ', answerNumber);
    // console.log('previousValue : ', previousValue);
    // console.log("------------------ | end | ----------------");

  };

  const nextBtnFunction = () => {
    console.log("------------------ | start | ----------------");
    console.log("surveyData : ", surveyData);
    // console.log("pageStatus : ", pageStatus);
    console.log("answerContent : ", answerContent);
    // console.log('answerNumber : ', answerNumber);
    console.log("------------------ | end | ------------------");
  
    const basicData = surveyData[pageStatus];
    const inputData = answerContent[pageStatus];
  
    // Create an array with default "wbtOk" values
    const tempErrors = new Array(6).fill("wbtOk"); 
    let hasError = false; // To track if there are errors
  
    basicData.content.forEach((item, index) => {
      const value = inputData[index];
  
      if (item.required) {
        // Check for required fields based on type
        if (item.dataType === "inputSmallText" || item.dataType === "verticalRadio") {
          if (!value || value === "") {
            tempErrors[index] = `${item.dataTitle} is required.`;
            hasError = true;
          }
        } else if (item.dataType === "verticalCheckBox") {
          if (!value || value === "") {
            tempErrors[index] = `${item.dataTitle} is required.`;
            hasError = true;
          } else {
            const selectedValues = value.split(',').map((val:string) => val.trim()).filter(Boolean);
            if (selectedValues.length === 0) {
              tempErrors[index] = `${item.dataTitle} is required.`;
              hasError = true;
            }
          }
        } else if (item.dataType === "inputSmallNumber") {
          const numberValue = Number(value);
          if (!value || value === "") {
            tempErrors[index] = `${item.dataTitle} is required.`;
            hasError = true;
          } else if (isNaN(numberValue) || numberValue < item?.additionalData?.minValue || numberValue > item?.additionalData?.maxVal) {
            tempErrors[index] = `You must be between ${item?.additionalData?.minValue} and ${item?.additionalData?.maxVal}.`;
            hasError = true;
          }
        }
      }
    });
  
    // If there are no errors, the totalErrors should remain "wbtOk"
    if (hasError) {
      console.log("Validation Errors: ", tempErrors);
    } else {
      console.log("No validation errors.");
    }
  
    // Set the totalErrors state
    setTotalErrors(tempErrors);
  
    // If no errors were found, proceed to the next page
    if (!hasError) {
      setModalShowStatus(true);
    }
  };

  const submitFunction = () => {
    setSubmitStatus(true);
    nextBtnFunction();
  };

  interface DisplayContentProps {
    basicData: string[];
    answerData: string;
  }

  const DisplayContent = ({basicData, answerData}:DisplayContentProps) => {
    console.log(answerData);
    if(answerData){
      const answerSplitData = answerData.split(",");
  
      console.log("answerSplitData : ", answerSplitData);
      console.log("basicData : ", basicData);
  
      return (
        basicData.map((item, index) => {
          if(answerSplitData.includes(index.toString())){
            return (
              <p key={index} className='content'>{item}</p>
            )
          }
        })
      );
    }
    else {
      return (
        <p className='content'>There is No Data</p>
      )
    }
    
  };

  const handleUltimateData = () => {
    setModalShowStatus(false);    
    alert('Congulations! Successfully Submited!')
    window.location.href = "/";
  }

  return (
    <div className='mySurvey'>
      <div className='style_2'>
        <div className="container_centering">
          <div className="container" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <div className="row justify-content-end" style={{ width: '100%' }}>
              <div className="col-xl-6 col-lg-6 d-flex align-items-center flex-wrap surveyAdd">
                {
                  pageStatus !== 0 &&
                  <div className="pageDots">
                    <div className='pageBar'></div>
                    {surveyData.map((_, index) => (
                      <span key={index} className={'pageDot ' + (pageStatus > index ? 'pageDotactive' : '')}>
                        <BiCheckDouble />
                      </span>
                    ))}
                  </div>
                }
                <div className="main_title_1">
                  <h3><img src={img1} width="80" height="80" alt="" /> Survey</h3>
                  <p>Our recent survey reveals diverse sleep patterns and factors affecting quality rest.</p>
                  <p><em>- The Satisfyc Team</em></p>
                  <div style={{ color: 'white' }}>The survey highlighted that over 60% of participants struggle with falling asleep regularly. Many respondents cited stress and screen time as primary contributors to their sleep difficulties. Understanding these issues can help develop better strategies for improving sleep quality in our community.</div>
                </div>
                {pageStatus !== 0 && (
                  <div className="progressBarContainer">
                    <div className="progressBar" style={{ width: ((answerNumber[pageStatus] === undefined ? 0 : answerNumber[pageStatus]) * 100 / surveyData[pageStatus].content.length) + '%' }}>
                      <div className="numberPanel">
                        {`${answerNumber[pageStatus] === undefined ? 0 : answerNumber[pageStatus]} of `}{surveyData[pageStatus].content.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-xl-5 col-lg-5">
                <div id="wizard_container">
                  <form id="wrapped" method="POST" autoComplete="off">
                    <input id="website" name="website" type="text" value="" style={{ display: 'none' }} />
                    <div id="middle-wizard">
                      {surveyData.map((item, index) => {
                        if (pageStatus + 1 === item.id) {
                          return (
                            <SurveyGroup
                              key={index}
                              id={item.id}
                              pageStatus={pageStatus}
                              surveyData={item.content}
                              totalErrors={totalErrors}
                              answerContent={answerContent}
                              handleSetAnswerContent={handleSetAnswerContent}
                            />
                          );
                        }
                        return null; // Return null to avoid rendering nothing
                      })}
                    </div>
                    <div id="bottom-wizard">
                      {pageStatus !== 0 && <button type="button" name="backward" onClick={prevBtnFunction} className="backward">Prev</button>}
                      {pageStatus !== surveyData.length - 1 && <button type="button" name="forward" onClick={nextBtnFunction} className="forward">Next</button>}
                      {pageStatus === surveyData.length - 1 && <button type="button" name="process" onClick={submitFunction} className="submit">Submit</button>}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        modalShowStatus &&
          <div className='StepModalContainer'>
            <div className='StepModalRelative1'>
              <div className='StepModal'>
                <span className='close-btn' onClick={() => {setModalShowStatus(false)}}>&times;</span>
                <h1>Review of your -- Epworth Sleepiness Scale --</h1>
                <div className='mainPanel'>

                  {
                    surveyData[pageStatus].content.map((item, index) => {

                      if(item.dataType === "verticalCheckBox"){
                        return (
                          <div className='item' key={index}>
                            <h2 className='title'>{item.dataTitle}</h2>
                            <DisplayContent basicData={item.dataContent} answerData={answerContent[pageStatus][index]} />
                          </div>
                        );
                      }
                      else {
                        return (
                          <div className='item' key={index}>
                            <h2 className='title'>{item.dataTitle}</h2>
                            <p className='content'>{answerContent[pageStatus][index]}</p>
                          </div>
                        );
                      }
                    })
                  }
                </div>
                <div className="StepFlexRow">
                  {
                    submitStatus ?
                    (
                      <div className="button-24 button-24-green" onClick={handleUltimateData}>
                        Submit
                      </div>
                    )
                    :
                    (
                      <div className="button-24 button-24-green" onClick={() => {
                        setModalShowStatus(false);
                        setPageStatus(prev => Math.min(prev + 1, surveyData.length - 1)); // Prevent exceeding total pages
                      }}>
                        Go to Next Step
                      </div>
                    )
                  }
                  
                </div>


              </div>

            </div>
          </div> 
      }
    </div>
  );
}