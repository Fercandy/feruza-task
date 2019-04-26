import React from 'react'
import style from '../styles/CurrencyPairsRateList.module.css'

const CurrencyPairsRateList = ({ rate, grow, currencyValue }) => {
  const name1 = currencyValue && currencyValue[0].code
  const name2 = currencyValue && currencyValue[1].code

  return (
    <div className={style.currencyItem}>
      <h3>
        Code country:
        {currencyValue && `${name1}/${name2}`}
      </h3>
      <p>
        {`Rate: ${rate && rate} ${grow}`}
      </p>
    </div>
  )
}

export default CurrencyPairsRateList
