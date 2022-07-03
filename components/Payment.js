import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Currency from "react-currency-formatter";
import toast from "react-hot-toast";

//config & firebase
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "../config/axios";
import firebase from "firebase";
import db from "../config/firebase";

//redux
import { useDispatch, useSelector } from "react-redux";
import { selectShipping, resetShipping } from "../features/shippingSlice";
import { selectUser } from "../features/userSlice";
import {
  addQuantity,
  emptycCart,
  removeFromCart,
  removeQuantity,
  selectCart,
} from "../features/cartSlice";
import {
  selectDiscount10,
  getDiscount10,
  getDiscount20,
  cancleDiscount,
  selectDiscount20,
  getDiscount10percent,
  selectDiscount10percent,
} from "../features/discountSlice";
import {
  getPricePoint,
  selectPricePoint,
  selectUserPoint,
  getFinalPoint,
  selectFinalPoint,
  addFinalPrice,
  selectFinalPrice,
  getUserPoint,
} from "../features/pointSlice";

//icons
import { MdCancel } from "react-icons/md";
//icons
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { selectDarkmode } from "../features/darkmodeSlice";

function Payment({ setPhase }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkmode);
  const stripe = useStripe();
  const elements = useElements();
  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);
  const shipping = useSelector(selectShipping);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [userData, setUserData] = useState([]);

  //const pricePoint = calcTotalCost();
  //const [userPoint, setUserPoint] = useState(0);
  const userPoint = useSelector(selectUserPoint);
  const [pricePoint, setPricePoint] = useState(0);
  const newPricepoint = useSelector(selectPricePoint);
  const [finalPoint, setFinalPoint] = useState(Number(0));
  const newFinalPoint = useSelector(selectFinalPoint);
  const [redem, setRedem] = useState(false);
  const [coin, setCoin] = useState(Number(0));

  ///discount
  const discount10 = useSelector(selectDiscount10);
  const discount20 = useSelector(selectDiscount20);
  const discount10percent = useSelector(selectDiscount10percent);

  //price
  const finalPrice = useSelector(selectFinalPrice);

  useEffect(() => {
    const unsubscribe = db
      .collection("users")
      .doc(user?.uid)
      .onSnapshot((snapshot) => setUserData(snapshot.data()));
    return unsubscribe;
  }, [db, user]);

  const checkCode = (codes) => {
    const code = userData?.usedDiscountCode?.includes(codes);
    return code;
  };

  useEffect(() => {
    if (cart) {
      let totalCost = 0;
      cart.forEach((item) => {
        totalCost = totalCost + item.quantity * item.price;
      });
      setPricePoint(totalCost);
    }
  }, [cart]);

  useEffect(() => {
    let newFinalPoint = Math.round(
      Number(userPoint) + Number(newPricepoint) - Number(coin * 100)
    );
    setFinalPoint(Number(newFinalPoint));
  });

  useEffect(() => {
    dispatch(getUserPoint(userData?.point));
    dispatch(getPricePoint(pricePoint));
    dispatch(getFinalPoint(finalPoint));
  }, [userData, pricePoint, finalPoint]);

  const verifiedCode = () => {
    if (!checkCode(code)) {
      if (code === "super10") {
        dispatch(getDiscount10(true));
        setVerified(true);
      } else if (code === "super20") {
        dispatch(getDiscount20(true));
        setVerified(true);
      } else if (code === "ultra10") {
        dispatch(getDiscount10percent(true));
        setVerified(true);
      } else if (code === "") {
        setCode("");
        setErrorCode("Plese Enter the code");
      } else {
        setCode("");
        setErrorCode("Wrong Code please try agian");
      }
    } else {
      setCode("");
      setErrorCode("Code used please try agian");
    }
  };

  const redemUserPoint = () => {
    if (!redem) {
      setRedem(true);
      let point = Number(userPoint / 100);
      setCoin(point);
    } else {
      setCoin(Number(0));
      setRedem(false);
    }
  };

  const cancleCode = () => {
    dispatch(cancleDiscount());
    setCode("");
    setVerified(false);
    setErrorCode("");
  };

  const renderMethod = () => {
    if (shipping?.shippingCost == 50) {
      return "Delivery";
    } else if (shipping?.shippingCost == 10) {
      return "COD";
    } else {
      return "Shop Pickup";
    }
  };

  const add = (item) => {
    let ind = _.findIndex(cart, { id: item.id });
    toast.success(`One set of ${item?.name} is added ...`);

    return dispatch(addQuantity(ind));
  };

  const remove = (item) => {
    if (item.quantity != 1) {
      let ind = _.findIndex(cart, { id: item.id });
      toast.success(`One set of ${item?.name} is remove ...`);

      return dispatch(removeQuantity(ind));
    }
    let ind = _.findIndex(cart, { id: item.id });
    dispatch(removeFromCart(ind));
    toast.success(`${item?.name} Remove from cart`);
  };

  const calcTotalCost = () => {
    let totalCost = 0;
    cart.forEach((item) => {
      totalCost = totalCost + item.quantity * item.price;
    });
    return totalCost;
  };

  const calcTotalCostWithShipping = () => {
    let totalCost = 0;
    cart.forEach((item) => {
      totalCost = totalCost + item.quantity * item.price;
    });
    let newCost = totalCost + shipping?.shippingCost - coin;
    let discountPercent10 = Number(totalCost) * 0.1;

    if (discount10) {
      return newCost - 10;
    } else if (discount20) {
      return newCost - 20;
    } else if (discount10percent) {
      return newCost - discountPercent10;
    } else {
      return newCost;
    }
  };

  useEffect(() => {
    dispatch(addFinalPrice(calcTotalCostWithShipping()));
  });

  const calculatediscount = () => {
    let totalCost = 0;
    cart.forEach((item) => {
      totalCost = totalCost + item.quantity * item.price;
    });
    if (discount10) {
      return 10;
    }
    if (discount20) {
      return 20;
    }
    if (discount10percent) {
      return (totalCost + shipping?.shippingCost) * 0.1;
    }
  };

  useEffect(() => {
    //generate the special stripe secret which allows us to charge a customer
    const getClientSecret = async () => {
      if (!disabled) {
        const response = await axios({
          method: "post",
          // Stripe expects the total in a currencies subunits
          url: `/payments/create?total=${finalPrice * 100}`,
        });
        setClientSecret(response.data.clientSecret);
      } else setClientSecret(null);
    };
    getClientSecret();
  }, [disabled, cart]);

  const handleSubmit = async (event) => {
    // do all the fancy stripe stuff...
    event.preventDefault();
    setProcessing(true);
    toast.success(`Processing your payment , Please be patient...`);
    const payload = await stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })
      .then(({ paymentIntent }) => {
        // paymentIntent = payment confirmation

        db.collection("users")
          .doc(user?.uid)
          .collection("orders")
          .doc(paymentIntent.id)
          .set({
            cart: cart,
            amount: paymentIntent.amount,
            method: renderMethod(),
            availableDate: shipping?.availableDate,
            preferredTime: shipping?.preferredTime,
            contactName: shipping?.contactName,
            contactNumber: shipping?.contactNumber,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            code: verified && calculatediscount(),
            point: redem && coin,
            received: Boolean(false),
          });

        if (verified) {
          db.collection("users")
            .doc(user?.uid)
            .set(
              {
                point: newFinalPoint,
                usedDiscountCode:
                  firebase.firestore.FieldValue.arrayUnion(code),
              },
              { merge: true }
            );
        } else {
          db.collection("users").doc(user?.uid).set(
            {
              point: newFinalPoint,
            },
            { merge: true }
          );
        }

        setSucceeded(true);
        setError(null);
        setProcessing(false);
        dispatch(cancleDiscount());
        dispatch(emptycCart());
        dispatch(resetShipping());
        setPhase("done");
        toast.success(`Your Order has been made`);
      });
  };

  const handleChange = (event) => {
    //Listen for changes in the Card Element
    //display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const navShipping = () => {
    setError(null);
    setProcessing(false);
    dispatch(cancleDiscount());
    setPhase("shipping");
  };

  return (
    <div className={`p-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
      <h1 className="mb-4 text-center text-2xl font-bold">
        Confirm your order:
      </h1>
      <div className="flex flex-col gap-2 mb-8">
        {cart.map((item) => (
          <div
            key={item._id}
            className="p-2 border-b-2 border-gray-300 select-none"
          >
            <div className="flex  items-center">
              <div className="relative">
                <Link href={`/product/${item.id}`}>
                  <Image
                    src={item.imageUrl}
                    height={300}
                    width={300}
                    objectFit="contain"
                    className={` cursor-pointer  transition duration-300 ease-in transform sm:hover:scale-125`}
                  />
                </Link>
              </div>
              <div className="flex flex-col items-start ml-6">
                <Link href={`/product/${item.id}`}>
                  <h1 className="w-full text-xl hover:link">{item.name}</h1>
                </Link>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
            </div>
            <div className="w-full flex justify-between mt-3">
              <div className="w-full flex items-center gap-2 text-2xl">
                <AiOutlinePlus
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                  onClick={() => add(item)}
                />
                <p className="text-gray-600">{item.quantity}</p>
                <AiOutlineMinus
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={() => remove(item)}
                />
              </div>
              <h1 className="w-full text-right text-xl">
                <Currency
                  quantity={item.quantity * item.price}
                  currency="MYR"
                />
              </h1>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <div className="flex justify-between">
          <p>Subtotal: </p>
          <Currency quantity={calcTotalCost()} currency="MYR" />
        </div>
        <div className="flex justify-between mt-1">
          <p>Shipping Cost ({renderMethod()}) : </p>
          <Currency quantity={shipping?.shippingCost} currency="MYR" />
        </div>
        {userPoint > 0 && (
          <div className="flex justify-between mt-2">
            <p>
              Member Point(<span className="ml-1 mr-1">{userPoint}</span>
              <span className="mr-1">Point</span>)
            </p>
            {!redem ? (
              <button
                onClick={redemUserPoint}
                className={`bg-gray-100 text-black px-2 py-1 rounded-md font-medium ${
                  userPoint == 0 && "opacity-50"
                }`}
              >
                Redem
              </button>
            ) : (
              <div className="flex items-center justify-center">
                -
                <Currency quantity={coin} currency="MYR" />
                <MdCancel
                  onClick={redemUserPoint}
                  className=" text-red-500 w-4 h-4 cursor-pointer ml-1"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex w-full items-center justify-between my-3 space-x-4">
          {verified && <p>Discount:</p>}
          {!verified && <p>Code:</p>}

          {!verified ? (
            <div className="flex items-center justify-center w-full flex-grow">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={` ${
                  errorCode ? errorCode : "please enter your code"
                }`}
                className={`w-full flex-shrink bg-transparent focus:outline-none mr-4 ${
                  errorCode && "placeholder-red-400"
                }`}
              />
              <button
                disabled={!code}
                onClick={verifiedCode}
                className={`bg-gray-100 text-black px-2 py-1 rounded-md font-medium ${
                  !code && "opacity-50"
                }`}
              >
                verified
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              -
              <Currency quantity={calculatediscount()} currency="MYR" />
              <MdCancel
                onClick={cancleCode}
                className=" text-red-500 w-4 h-4 cursor-pointer ml-1"
              />
            </div>
          )}
        </div>
        <div className="flex justify-between pt-2 border-t-2 border-gray-600 font-bold">
          <p>Total Cost: </p>
          <Currency quantity={finalPrice} currency="MYR" />
        </div>
        <div className="flex flex-row justify-between font-bold">
          <p>Total Point: </p>
          <p>{finalPoint} pt</p>
        </div>
      </div>
      <div className="mt-1">
        <form onSubmit={handleSubmit}>
          {!clientSecret && (
            <p className={`text-center font-bold text-red-500`}>
              Connecting ... Please Fill in Card Number
            </p>
          )}
          {clientSecret && (
            <p className={`text-center font-bold text-green-500`}>
              Network Access Ready for Payment
            </p>
          )}
          <CardElement
            onChange={handleChange}
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: `${darkMode ? "#fafafa" : "#424770"}`,
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
          <div className="flex gap-5 mt-5 justify-between">
            <button
              className="uppercase p-2 text-xl rounded text-blue-600 border-2 border-blue-600"
              onClick={navShipping}
            >
              <FaArrowLeft className="inline" /> Back
            </button>
            <button
              className={`p-2 text-xl rounded text-gray-200 bg-blue-600 flex-grow hover:bg-blue-900 hover:ring-1 transition ease-in-out duration-150 ${
                disabled ? "opacity-50" : "opacity-100"
              }`}
              disabled={
                processing ||
                disabled ||
                succeeded ||
                cart?.length === 0 ||
                !user ||
                !clientSecret
              }
            >
              {processing ? "Processing" : "Buy Now"}
              <FaArrowRight className="inline" />
            </button>
          </div>
          {error && <div>{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Payment;
