import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Select, message } from 'antd'
import { endpoint, interval } from '../config'
import 'antd/dist/antd.css'
import style from '../styles/CurrencyPairsSelector.module.css'
import CurrencyPairsRateList from './CurrencyPairsRateList'

const { Option } = Select

const CurrencyPairsSelector = () => {
  const [currencies, setCurrencies] = useState({})
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(localStorage.getItem('currencyPairs') || undefined)
  const [rate, setRate] = useState(localStorage.getItem('rate') || '')
  const [grow, setGrow] = useState(localStorage.getItem('grow') || '')

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(`${endpoint}/configuration/`)
      setCurrencies(response.data)
    } catch (error) {
      message.error(error.message)
    }
  }

  useEffect(() => {
    fetchCurrencies()
  }, [])

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (selectedCurrencyId) {
      const updateTimer = setInterval(async () => {
        try {
          const rateData = await updateRates(selectedCurrencyId)
          if (rateData.status === 200) {
            const updatedRate = rateData.data.rates && rateData.data.rates[selectedCurrencyId]
            setRate(updatedRate)
            localStorage.setItem('rate', updatedRate)

            showTrending(updatedRate)
          }
        } catch (error) {
          setGrow('')
          setRate(0)
          message.error('Failed updating the rate')
        }
      }, interval)
      return () => {
        clearTimeout(updateTimer)
      }
    }
  }, [rate])

  function showTrending(updatedRate) {
    if (updatedRate > rate) {
      setGrow('↑')
    } else if (updatedRate < rate) {
      setGrow('↓')
    } else if (updatedRate === rate) {
      setGrow('-')
    }
  }
  async function handleChange(newCurrencyId) {
    setSelectedCurrencyId(newCurrencyId)
    localStorage.setItem('currencyPairs', newCurrencyId)
    try {
      const getRate = await updateRates(newCurrencyId)
      const newRate = getRate.data.rates && getRate.data.rates[newCurrencyId]
      setRate(newRate)
      localStorage.setItem('rate', newRate)

      setGrow('')
      localStorage.setItem('grow', grow)
    } catch (error) {
      setRate(0)
      setGrow('')
      message.error('Failed no such data for the currency pairs')
    }
  }
  const currenciesData = currencies.currencyPairs
  if (!currenciesData) return null

  const display = ([currency1, currency2]) => `${currency1.name}(${currency1.code}) / ${currency2.name}(${currency2.code})`
  const currencyList = Object.entries(currenciesData).map(
    ([key, val]) => <Option value={key} key={key}>{ display(val) }</Option>,
  )

  const currencyKey = Object.keys(currenciesData).find(key => key === selectedCurrencyId)
  const currencyValue = currenciesData[currencyKey]

  if (!currencies) {
    return (
      <div>
        <span>Please wait..</span>
      </div>
    )
  }
  return (
    <div className={style.currencyWrapper}>
      <Select
        showArrow
        value={selectedCurrencyId}
        placeholder="Select currency pairs"
        onChange={handleChange}
        style={{ width: '300px', marginBottom: '5rem' }}
      >
        {currencyList}
      </Select>
      <CurrencyPairsRateList
        currencyValue={currencyValue}
        rate={rate}
        grow={grow}
      />
    </div>
  )
}

async function updateRates(currencyId) {
  const res = await axios.get(`${endpoint}/rates`, {
    params: {
      currencyPairIds: [currencyId],
    },
  })
  return res
}



export default CurrencyPairsSelector
