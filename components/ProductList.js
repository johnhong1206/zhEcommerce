import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import Currency from "react-currency-formatter";
import Fade from "react-reveal/Fade";
import toast from "react-hot-toast";

//icons
import { FaRegEye, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { AiOutlineLogin } from "react-icons/ai";
import {
  addQuantity,
  addToCart,
  removeFromCart,
  removeQuantity,
  selectCart,
} from "../features/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
let _ = require("lodash");

function ProductList({
  id,
  name,
  price,
  images,
  description,
  category,
  rating,
  product,
}) {
  const user = useSelector(selectUser);
  const router = useRouter();
  const cart = useSelector(selectCart);
  const dispatch = useDispatch();

  const navtoLogin = (e) => {
    router.push("/login");
  };
  const addToCartHandler = () => {
    toast.success(`${product?.name} Add to Cart...`);
    if (cart.find((cartproduct) => cartproduct.id == product.id)) {
      let ind = _.findIndex(cart, { id: product.id });

      return dispatch(addQuantity(ind));
    }
    let tempItem = { ...product, quantity: 1 };
    dispatch(addToCart(tempItem));
  };
  const remove = () => {
    let tempItem = cart[_.findIndex(cart, { id: product.id })];
    if (!!tempItem == false) {
      false;
    }
    if (!!tempItem == true && tempItem.quantity != 1) {
      let ind = _.findIndex(cart, { id: product.id });
      toast.success(`${product?.name} remove from Cart...`);
      return dispatch(removeQuantity(ind));
    }
    let ind = _.findIndex(cart, { _id: product._id });
    dispatch(removeFromCart(ind));
    toast.success(`${product?.name} remove from Cart...`);
  };

  return (
    <>
      <Fade bottom>
        <div
          key={id}
          className=" relative flex flex-col m-5 bg-white z-30 p-10 shadow-lg"
        >
          <p className="absolute top-2 right-2 text-xs italic text-gray-400">
            {category}
          </p>
          <Link href={`/product/${id}`}>
            <Image
              quality={50}
              src={images}
              height={300}
              width={300}
              objectFit="contain"
              className={` cursor-pointer  transition duration-300 ease-in transform sm:hover:scale-125`}
            />
          </Link>
          <Link href={`/product/${id}`}>
            <h4 className="my-3 text-center text-lg font-medium cursor-pointer">
              {name}
            </h4>
          </Link>

          <div className="flex">
            {Array(rating)
              .fill()
              .map((_) => (
                <p>⭐</p>
              ))}
          </div>
          <p className="text-xs my-2 line-clamp-2">{description}</p>
          <div className="mb-5 flex item-center justify-center font-medium">
            <Currency quantity={price} currency="MYR" />
          </div>
          <div className="absolute bottom-3 left-5 right-5  flex item-center justify-center space-x-6">
            <Link href={`/product/${id}`}>
              <FaRegEye className="w-6 h-6 p-1 text-gray-200 rounded-full bg-purple-600 hover:bg-purple-800 cursor-pointer" />
            </Link>

            <FaMinus
              className="w-6 h-6 p-1 text-gray-200 rounded-full bg-red-600 hover:bg-red-800 cursor-pointer"
              onClick={remove}
            />
            <div className=" flex flex-col items-center justify-center">
              <p className="w-6 h-6 leading-6 text-center text-xl text-gray-200 rounded-full bg-gray-900 select-none">
                {_.findIndex(cart, { id: product.id }) != -1
                  ? cart[_.findIndex(cart, { id: product.id })].quantity
                  : "0"}
              </p>
            </div>
            <FaPlus
              className="w-6 h-6 p-1 text-gray-200 rounded-full bg-green-600 hover:bg-green-800 cursor-pointer "
              onClick={addToCartHandler}
            />
            {!user ? (
              <AiOutlineLogin
                onClick={navtoLogin}
                className="w-6 h-6 p-1 text-gray-200 rounded-full bg-blue-600 cursor-pointer hover:bg-blue-800"
              />
            ) : (
              <Link href={`/Cart`}>
                <FaShoppingCart className="w-6 h-6 p-1 text-gray-200 rounded-full bg-cyan-600 hover:bg-cyan-800 cursor-pointer " />
              </Link>
            )}
          </div>
        </div>
      </Fade>
    </>
  );
}

export default ProductList;
