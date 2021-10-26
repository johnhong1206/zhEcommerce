import Head from "next/head";

//components
import ProductDetails from "../../components/ProductDetails";
import Header from "../../components/Header";
import Menu from "../../components/Menu";

//firebase
import db from "../../config/firebase";

//redux
import { selectDarkmode } from "../../features/darkmodeSlice";
import { useSelector } from "react-redux";
import { selectmenuIsOpen } from "../../features/menuSlice";

function ProductScreen({ product, products }) {
  //const dispatch = useDispatch();
  //const product = useSelector(selectOpenProduct);
  const darkMode = useSelector(selectDarkmode);
  const MenuNav = useSelector(selectmenuIsOpen);

  console.log(products);

  return (
    <div className={`${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
      <Head>
        <title>Product-{product.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header products={products} />
      <main className="mx-auto max-w-screen">
        <ProductDetails
          key={product.id}
          id={product.id}
          product={product}
          name={product.name}
          price={product.price}
          category={product.category}
          images={product.imageUrl}
          rating={product.rating}
          description={product.description}
          activeImg={product.activeImg}
          countInStock={product.countInStock}
        />
      </main>

      <div className=" pb-10" />
      {MenuNav && <Menu />}
    </div>
  );
}

export default ProductScreen;

export async function getServerSideProps(context) {
  const ref = db.collection("products").doc(context.query.id);

  const productRes = await ref.get();
  const product = {
    id: productRes.id,
    ...productRes.data(),
  };

  const allProductRef = db.collection("products");
  const AllproductRes = await allProductRef.get();
  const products = AllproductRes.docs.map((product) => ({
    id: product.id,
    ...product.data(),
  }));

  return {
    props: {
      product: product,
      products: products,
    },
  };
}
