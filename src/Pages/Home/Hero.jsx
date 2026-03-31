import React, { useEffect, useState } from 'react'
import style from "./Home.module.css"

export const Hero = () => {
    return (
        < div className = { style.hero } >
            <h1>Welcome TO</h1>
            <div className={style.center}>
                <img src="/assets/hero.svg" alt="imgb" />
                <div>
                    <h1>BRAVEA</h1>
                    <div className='d-flex justify-content-center gap-3 mt-md-5 pt-lg-4 pt-2 mx-auto'>
                        <button className='btn-fill-light py-sm-3  w-50'>Get Started</button>
                        <button className='btn-light py-sm-3  w-50'>What is Bravea?</button>
                    </div>
                </div>
            </div>
        </div >
    )
}
