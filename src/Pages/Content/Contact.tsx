import "./Contact.css";

export default function Contact() {
  return (
    <div className="shopping-cart-container bg-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left side */}
        <div className="flex-1">
          <button
            type="button"
            className="continue-shopping-btn inline-flex items-center text-gray-700 font-semibold text-sm mb-6 hover:text-gray-900"
          >
            <i className="fas fa-arrow-left mr-2" />
            Continue shopping
          </button>
          <hr className="border-gray-300 mb-6" />
          <div className="flex justify-between items-center mb-4 text-gray-700 text-sm">
            <div>Shopping cart</div>
            <div className="text-xs">
              Sort by: price <i className="fas fa-chevron-down ml-1" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            You have 4 items in your cart
          </p>
          {/* Cart items */}
          <ul className="space-y-6">
            <li
              aria-label="Iphone 11 pro, 256GB Navy Blue, quantity 2, price $900 each"
              className="cart-item flex items-center bg-white rounded-lg shadow-md p-4"
            >
              <img
                alt="Iphone 11 pro 256GB Navy Blue product image"
                className="w-16 h-16 rounded-md object-cover"
                height="64"
                src="https://storage.googleapis.com/a1aa/image/e09aab89-3a28-443a-a89c-c7697bc78d92.jpg"
                width="64"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-gray-900 font-semibold text-base leading-tight">
                  Iphone 11 pro
                </h3>
                <p className="text-gray-500 text-xs mt-1">256GB, Navy Blue</p>
              </div>
              <div className="text-center w-10 text-gray-900 font-semibold text-lg select-none">
                2
              </div>
              <div className="text-gray-900 font-semibold text-lg w-20 text-right">
                $900
              </div>
              <button
                aria-label="Remove Iphone 11 pro from cart"
                className="text-gray-300 hover:text-gray-400 ml-4"
                type="button"
              >
                <i className="fas fa-trash-alt" />
              </button>
            </li>
            <li
              aria-label="Samsung galaxy Note 10, 256GB Navy Blue, quantity 2, price $900 each"
              className="cart-item flex items-center bg-white rounded-lg shadow-md p-4"
            >
              <img
                alt="Samsung galaxy Note 10 256GB Navy Blue product image"
                className="w-16 h-16 rounded-md object-cover"
                height="64"
                src="https://storage.googleapis.com/a1aa/image/0a20c2fa-c588-4285-f4ef-95d99e57d125.jpg"
                width="64"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-gray-900 font-semibold text-base leading-tight">
                  Samsung galaxy Note 10
                </h3>
                <p className="text-gray-500 text-xs mt-1">256GB, Navy Blue</p>
              </div>
              <div className="text-center w-10 text-gray-900 font-semibold text-lg select-none">
                2
              </div>
              <div className="text-gray-900 font-semibold text-lg w-20 text-right">
                $900
              </div>
              <button
                aria-label="Remove Samsung galaxy Note 10 from cart"
                className="text-gray-300 hover:text-gray-400 ml-4"
                type="button"
              >
                <i className="fas fa-trash-alt" />
              </button>
            </li>
            <li
              aria-label="Canon EOS M50, Onyx Black, quantity 1, price $1199"
              className="cart-item flex items-center bg-white rounded-lg shadow-md p-4"
            >
              <img
                alt="Canon EOS M50 Onyx Black product image"
                className="w-16 h-16 rounded-md object-cover"
                height="64"
                src="https://storage.googleapis.com/a1aa/image/94583c67-8b93-42c9-f442-eff0f77dd401.jpg"
                width="64"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-blue-700 font-semibold text-base leading-tight">
                  Canon EOS M50
                </h3>
                <p className="text-gray-500 text-xs mt-1">Onyx Black</p>
              </div>
              <div className="text-center w-10 text-gray-900 font-semibold text-lg select-none">
                1
              </div>
              <div className="text-gray-900 font-semibold text-lg w-20 text-right">
                $1199
              </div>
              <button
                aria-label="Remove Canon EOS M50 from cart"
                className="text-gray-300 hover:text-gray-400 ml-4"
                type="button"
              >
                <i className="fas fa-trash-alt" />
              </button>
            </li>
            <li
              aria-label="MacBook Pro, 1TB Graphite, quantity 1, price $1799"
              className="cart-item flex items-center bg-white rounded-lg shadow-md p-4"
            >
              <img
                alt="MacBook Pro 1TB Graphite product image"
                className="w-16 h-16 rounded-md object-cover"
                height="64"
                src="https://storage.googleapis.com/a1aa/image/287ba327-49e9-49d5-d1e8-3a1fce320bf1.jpg"
                width="64"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-gray-900 font-semibold text-base leading-tight">
                  MacBook Pro
                </h3>
                <p className="text-gray-500 text-xs mt-1">1TB, Graphite</p>
              </div>
              <div className="text-center w-10 text-gray-900 font-semibold text-lg select-none">
                1
              </div>
              <div className="text-gray-900 font-semibold text-lg w-20 text-right">
                $1799
              </div>
              <button
                aria-label="Remove MacBook Pro from cart"
                className="text-gray-300 hover:text-gray-400 ml-4"
                type="button"
              >
                <i className="fas fa-trash-alt" />
              </button>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <aside
          aria-label="Card details form"
          className="card-details-form w-full max-w-sm bg-blue-600 rounded-lg p-6 text-white flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg">Card details</h2>
              <img
                alt="User profile picture"
                className="w-10 h-10 rounded-md object-cover"
                height="40"
                src="https://storage.googleapis.com/a1aa/image/30ac326e-d8cd-452b-ec8c-e105d64ad8af.jpg"
                width="40"
              />
            </div>
            <p className="font-semibold text-sm mb-2">Card type</p>
            <div className="flex space-x-3 mb-6">
              <img
                alt="Mastercard logo"
                className="h-6"
                height="24"
                src="https://storage.googleapis.com/a1aa/image/74e75176-e7d3-4ac1-a97d-9bb67b478c0a.jpg"
                width="40"
              />
              <img
                alt="Visa logo"
                className="h-6"
                height="24"
                src="https://storage.googleapis.com/a1aa/image/439c744a-36f1-4d55-07e7-17632f71944e.jpg"
                width="40"
              />
              <img
                alt="American Express logo"
                className="h-6"
                height="24"
                src="https://storage.googleapis.com/a1aa/image/f0b2d942-5ee7-43b0-a575-e0d2e8d1b467.jpg"
                width="40"
              />
              <img
                alt="PayPal logo"
                className="h-6"
                height="24"
                src="https://storage.googleapis.com/a1aa/image/c2453705-b517-4a80-8c71-59d951c83a35.jpg"
                width="40"
              />
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                className="w-full rounded border border-blue-400 bg-blue-600 placeholder-blue-200 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Cardholder's Name"
                required
                type="text"
              />
              <input
                className="w-full rounded border border-blue-400 bg-blue-600 placeholder-blue-200 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Card Number"
                required
                type="text"
              />
              <div className="flex space-x-4">
                <input
                  className="flex-1 rounded border border-blue-400 bg-blue-600 placeholder-blue-200 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Expiration"
                  required
                  type="text"
                />
                <input
                  className="w-20 rounded border border-blue-400 bg-blue-600 placeholder-blue-200 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Cvv"
                  required
                  type="text"
                />
              </div>
            </form>
            <hr className="border-blue-400 my-6" />
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$4798.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$20.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total(Incl. taxes)</span>
                <span>$4818.00</span>
              </div>
            </div>
          </div>
          <button
            className="mt-8 bg-cyan-500 hover:bg-cyan-600 transition-colors rounded-md py-3 font-semibold text-sm flex justify-center items-center gap-2"
            type="submit"
          >
            <span>$4818.00</span>
            <span className="uppercase">Checkout</span>
            <i className="fas fa-arrow-right" />
          </button>
        </aside>
      </div>
    </div>
  );
}
