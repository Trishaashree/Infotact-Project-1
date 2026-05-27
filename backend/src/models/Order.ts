import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    customer: String,

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },

        quantity: Number,

        price: Number,
      },
    ],

    total: Number,
paymentMethod: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)