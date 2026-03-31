import React, { useState } from 'react'
import style from "../../Styles/Nav.module.css"
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';


export const Navbar = () => {
    const { openConnectModal } = useConnectModal()
    const { isConnected } = useAccount()
    const [isopen, setOpen] = useState(false)
    const { pathname } = useLocation();

    const outterClick = (e) => {
        const istarget = [...e.target.classList].includes("outterdiv")
        if (!istarget) return
        setOpen(false)
    }
    return (
        <nav className={style.nav + " self_container d-flex justify-content-between align-items-center gap-2"}>
            <div className='d-flex align-items-center justify-content-between gap-5 col-xl-6 col-xxl-5'>
                <Link to="/" className={style.logo}>
                    <img src="/assets/logo.svg" alt="logo img" />
                </Link>
                <div className={style.links_parent + " outterdiv"}
                    style={{ right: isopen ? "0" : "-100vw" }} onClick={outterClick}>
                    <ul className='list-unstyled d-lg-flex align-items-center gap-xl-5 gap-4 pt-3 pt-lg-0 gap-4 mb-0'>
                        <button className='d-lg-none' onClick={() => { setOpen(false) }}><i className="bi bi-x-lg"></i></button>
                        <li className='mt-4 mt-md-0'>
                            <Link to="/" className={pathname === "/" && "opacity-100"} onClick={() => { setOpen(false) }}>Home</Link>
                        </li>
                        <li>
                            <Link to="/dashboard" className={pathname === "/dashboard" && "opacity-100"} onClick={() => { setOpen(false) }}>DASHBOARD</Link>
                        </li>
                        <li className={style.dropdown}>
                            <span className={pathname !== "/" && pathname !== "/dashboard" && "opacity-100"} >TOOLS</span>
                            <ul className='list-unstyled'>
                                <li className={`${pathname === "/mint" && style.activelink} d-flex gap-3 align-items-center`}>
                                    <div>
                                        <img src="/assets/icons/add-light.svg" alt="" />
                                    </div>
                                    <Link to="/mint" className={`opacity-100`} onClick={() => { setOpen(false) }}>Mint</Link>
                                </li>
                                <li className={`${pathname === "/stake" && style.activelink} d-flex gap-3 align-items-center`}>
                                    <div>
                                        <img src="/assets/icons/sign-in.svg" alt="" />
                                    </div>
                                    <Link to="/stake" className={`opacity-100`} onClick={() => { setOpen(false) }}>Stake</Link>
                                </li>
                                <li className={`${pathname === "/farm" && style.activelink} d-flex gap-3 align-items-center`}>
                                    <div>
                                        <img src="/assets/icons/leaf.svg" alt="" />
                                    </div>
                                    <Link to="/farm" className={`opacity-100`} onClick={() => { setOpen(false) }}>Farm</Link>
                                </li>
                                <li className={`${pathname === "/lock" && style.activelink} d-flex gap-3 align-items-center`}>
                                    <div>
                                        <img src="/assets/icons/lock.svg" alt="" />
                                    </div>
                                    <Link to="/lock" className={`opacity-100`} onClick={() => { setOpen(false) }}>Lock</Link>
                                </li>
                                <li className={`${pathname === "/redeem" && style.activelink} d-flex gap-3 align-items-center`}>
                                    <div>
                                        <img src="/assets/icons/sign.svg" alt="" />
                                    </div>
                                    <Link to="/redeem" className={`opacity-100`} onClick={() => { setOpen(false) }}>Redeem</Link>
                                </li>
                            </ul>
                        </li>
                        {
                            !isConnected?
                            <button className="btn-fill-light d-lg-none mt-4 py-3 px-5 w-100" onClick={openConnectModal}>Connect Wallet</button>
                            :<div className='d-lg-none'><ConnectButton/></div>
                        }

                    </ul>
                </div>
            </div>
            <div className={style.right}>
                <button className="bg-transparent border-0 d-lg-none" onClick={() => setOpen(!isopen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20"><path fill="#fff" d="M224 80c0-26.5-21.5-48-48-48L80 32C53.5 32 32 53.5 32 80l0 96c0 26.5 21.5 48 48 48l96 0c26.5 0 48-21.5 48-48l0-96zm0 256c0-26.5-21.5-48-48-48l-96 0c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l96 0c26.5 0 48-21.5 48-48l0-96zM288 80l0 96c0 26.5 21.5 48 48 48l96 0c26.5 0 48-21.5 48-48l0-96c0-26.5-21.5-48-48-48l-96 0c-26.5 0-48 21.5-48 48zM480 336c0-26.5-21.5-48-48-48l-96 0c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l96 0c26.5 0 48-21.5 48-48l0-96z"></path></svg>
                </button>
                {
                    !isConnected ?
                        < button className="btn-fill-light d-none d-lg-block py-3 px-lg-5 px-4" onClick={openConnectModal}>Connect Wallet</button>
                        : <div className='d-none d-lg-block'><ConnectButton /></div>
                }
            </div>
        </nav >
    )
}
