import dynamic from "next/dynamic";
const ProductList = dynamic(() => import("./ProductList"));

//firebase
import { useCollection } from "react-firebase-hooks/firestore";
import db from "../config/firebase";

function ProductFeeds({ products }) {
  // grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
  return (
    <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:-mt-52 lg:-mt-70  -mt-14">
      {products.slice(0, 4).map((product) => (
        <ProductList
          id={product.id}
          rating={product.rating}
          category={product.category}
          name={product.name}
          price={product.price}
          images={product.imageUrl}
          description={product.description}
          product={product}
        />
      ))}
      <img
        src="/images/smbanner.jpg"
        alt="smallbanner"
        class="md:col-span-full"
      />
      <div class="md:col-span-2">
        {products.slice(4, 5).map((product) => (
          <ProductList
            id={product.id}
            rating={product.rating}
            category={product.category}
            name={product.name}
            price={product.price}
            images={product.imageUrl}
            description={product.description}
            product={product}
          />
        ))}
      </div>
      {products.slice(5, 10).map((product) => (
        <ProductList
          id={product.id}
          rating={product.rating}
          category={product.category}
          name={product.name}
          price={product.price}
          images={product.imageUrl}
          description={product.description}
          product={product}
        />
      ))}
      <img
        src="/images/smbanner.jpg"
        alt="smallbanner"
        className="px-5 md:col-span-full mx-auto rounded-lg"
      />
      {products.slice(10, products.length - 1).map((product) => (
        <ProductList
          id={product.id}
          rating={product.rating}
          category={product.category}
          name={product.name}
          price={product.price}
          images={product.imageUrl}
          description={product.description}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductFeeds;
