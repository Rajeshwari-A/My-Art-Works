import { useEffect, useState, useMemo } from 'react';
import { message } from 'antd';
import axios from 'axios';
import Loader from './LoderComponent';
import './App.css';
const _ = require('lodash');

function App() {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCountData, setpageCountData] = useState([])
  const [startIndex, setstartIndex] = useState(currentPage)
  const [endIndex, setendIndex] = useState(currentPage + 4)

  const fetchData = (pageNum = 0) => {
    setLoader(true)
    axios.get(`https://api.artic.edu/api/v1/artworks${pageNum ? "?page=" + pageNum : ''}`).then((res) => {
      setData(res.data.data)
      getTotalPageCount(res.data.pagination.total_pages)
      setLoader(false)

    }).catch((error) => {
      message.error(error.message, 5)
      setLoader(false)

    })
  }
  const fetchDataThrottled = useMemo(() => _.throttle(fetchData, 1000, currentPage), []);
  const getTotalPageCount = (pageCount) => {
    let pageCountData = []
    for (let i = 0; i < pageCount; i++) {
      pageCountData.push(i);
    }
    setpageCountData(pageCountData)
  }

  const handlePrev = () => {
    setCurrentPage(currentPage - 1)
    if (!((currentPage - 1) % 5)) {
      setstartIndex(currentPage - 5)
      setendIndex(currentPage - 1)
    }
  }

  const handleNext = () => {
    setCurrentPage(currentPage + 1)
    if (!((currentPage) % 5)) {
      setstartIndex(currentPage + 1)
      if (currentPage + 5 > pageCountData.length) {
        setendIndex(currentPage + (pageCountData.length - currentPage))
        return;
      } else {
        setendIndex(currentPage + 5)
      }
    }
  }
  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);

  }

  useEffect(() => {
    fetchDataThrottled(currentPage)
  }, [currentPage, fetchDataThrottled])



  return (
    <>
      {loader && <Loader />}
      <div className="image-gallery-wrapper">
        {
          data && data.map((val) => {
            return (
              <div className="image-grid" key={val.id}>
                <img src={val?.thumbnail?.lqip} alt={val?.thumbnail?.alt_text} />
                <div className="overlay">
                  <div key={val.id} className="text">
                  {!val?.thumbnail && <p style={{color:"#ffbf00"}}>Image Not provided</p>}
                    <p>ID: {val.id}</p>
                    <p style={{ whiteSpace: "break-spaces" }}>Title: {val.title}</p>
                    <p>Artist title: {val.artist_id}</p>
                    <p>Place of Origin: {val.place_of_origin}</p>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div className='pagination-wrapper'>
        <p className={`previous_round ${currentPage === 1 ? "disbled" : ""} `} onClick={handlePrev}>&laquo;</p>
        <ul>
          {
            currentPage < pageCountData.length && pageCountData.filter((val) => val && (val >= startIndex && val <= endIndex)).map((pageIndex) => {
              return (<li key={pageIndex} className={`${currentPage === pageIndex ? "active-link" : ""}`} onClick={() => handlePageClick(pageIndex)}>{pageIndex}</li>)
            })
          }
          {
            currentPage === pageCountData.length && (<li key={pageCountData.length} className={`${currentPage === pageCountData.length ? "active-link" : ""}`} onClick={() => handlePageClick(pageCountData.length)}>{pageCountData.length}</li>)
          }
        </ul>
        <p href="#" className={`next_round ${currentPage === pageCountData.length ? "disbled" : ""} `} onClick={handleNext}>&raquo;</p>
      </div>
    </>
  );
}

export default App;
