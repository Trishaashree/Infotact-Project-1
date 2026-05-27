import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: String,

    sku: {
      type: String,
      unique: true,
      index: true,
    },

    barcode: String,

    category: String,

    price: Number,

    stock: {
      type: Number,
      default: 0,
    },

    variants: [String],
  },
  { timestamps: true }
)

productSchema.index({
  name: 'text',
  category: 'text',
  sku: 'text',
})

export default mongoose.model('Product', productSchema)
