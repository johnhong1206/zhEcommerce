import moment from "moment";
import Currency from "react-currency-formatter";
import dynamic from "next/dynamic";

//firebase
import db from "../config/firebase";

//components
const OrderItem = dynamic(() => import("./OrderItem"));

//icons
import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md";

//redux
import { useSelector } from "react-redux";
import { selectDarkmode } from "../features/darkmodeSlice";

function OrderItemList({ order, id }) {
  const darkMode = useSelector(selectDarkmode);
  const timestamp = new Date(order.created.seconds * 1000).toUTCString();
  const point = order?.point;
  const code = order?.code;
  const received = order?.received;

  const toggleReceived = () => {
    if (!received) {
      db.collection("orders").doc(id).set(
        {
          received: true,
        },
        { merge: true }
      );
    } else {
      db.collection("orders").doc(id).set(
        {
          received: false,
        },
        { merge: true }
      );
    }
  };

  return (
    <div
      className={`w-full h-full xs:w-11/12 p-10 mt-10 xs: space-y-4 relative cursor-pointer transition duration-200 ease-in transform hover:shadow-lg hover:shadow-pink-400 ${
        darkMode ? "text-gray-200 bg-gray-900" : "text-gray-800 bg-gray-200"
      } ${received ? "opacity-100" : "opacity-70 border-blue-900 border"}`}
    >
      <div className="flex item-center flex-col">
        <div className="flex felx-row xs: space-x-2 md:space-x-4 ">
          <h1 className>Order:</h1>
          <p className="tracking-tighter">
            {order.id}{" "}
            <span className="ml-1 text-blue-500">{received && "received"}</span>
          </p>
        </div>

        <div className="flex flex-row space-x-1 mg:flex-row">
          <p>Discount:</p>
          {point && (
            <p>
              <span>-</span>
              <span className="text-yellow-500 font-medium ml-1">
                <Currency quantity={point} currency="MYR" />
              </span>
            </p>
          )}
          {code && (
            <p>
              <span>-</span>
              <span className="text-yellow-500 font-medium ml-1">
                <Currency quantity={code} currency="MYR" />
              </span>
            </p>
          )}
        </div>

        <div>
          <p className="text-sm ">{moment(timestamp).format("MMM Do YY")}</p>
        </div>
      </div>
      {!received ? (
        <MdCheckBoxOutlineBlank
          onClick={toggleReceived}
          className="absolute top-0 right-4 w-6 h-6 cursor-pointer hover:text-blue-500 hover:animate-pulse"
        />
      ) : (
        <MdCheckBox
          onClick={toggleReceived}
          className="absolute top-0 right-4 w-6 h-6 cursor-pointer hover:text-blue-500 hover:animate-pulse"
        />
      )}

      <div className="flex flex-col lg:flex-row space-x-4 overflow-x-scroll scrollbar-hide">
        {order.cart?.map((item) => (
          <OrderItem id={item.id} item={item} />
        ))}
        <div className="absolute bottom-4 right-10 font-bold hover:text-yellow-500">
          <Currency quantity={order.amount} currency="MYR" />
        </div>
      </div>

      {/** */}
    </div>
  );
}

export default OrderItemList;
