import React, { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

// firebase
import db from "../config/firebase";

//components
const CartPage = dynamic(() => import("../components/CartPage"));
const Menu = dynamic(() => import("../components/Menu"));
const Header = dynamic(() => import("../components/Header"));

//config & firebase
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { publishkey } from "../config/stripe";

//redux
import { useSelector } from "react-redux";
import { selectmenuIsOpen } from "../features/menuSlice";
import { selectUser } from "../features/userSlice";
import { selectDarkmode } from "../features/darkmodeSlice";

function Cart({ coupons }) {
  const darkMode = useSelector(selectDarkmode);
  const promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY);
  const MenuNav = useSelector(selectmenuIsOpen);
  const user = useSelector(selectUser);
  const [code, setCode] = useState([]);

  return (
    <div>
      <Head>
        <title>ZH Ecommerce - {user?.displayName} Cart</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div
        className={`flex flex-col w-full min-h-screen items-center justify-center ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        }
    `}
      >
        <Elements stripe={promise}>
          <CartPage coupons={coupons} />
        </Elements>
        {MenuNav && <Menu />}
      </div>
    </div>
  );
}

export default Cart;
export async function getServerSideProps({ res }) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  const ref = db.collection("coupon");

  const couponRes = await ref.get();
  const coupons = couponRes.docs.map((coupon) => ({
    id: coupon.id,
    ...coupon.data(),
  }));

  return {
    props: {
      coupons: coupons,
    },
  };
}
