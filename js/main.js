let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },

    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText" />
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                <a :href="link">More products like this</a>
                <p v-if="inStock">In Stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of stock</p>
                <span v-if="sale">On Sale</span>
                <span v-else>Not On Sale</span>
                <div class="color-box" v-for="(variant, index) in variants" :key="variant.variantId" :style="{ backgroundColor:variant.variantColor }" @mouseover="updateProduct(index)"></div>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>
                <div class="cart">
                    <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart</button>
                    <button v-on:click="removeFromCart" :class="{ disabledButton: !inStock }">Remove from cart</button>
                </div>
            </div>
            <product-tabs :reviews="reviews"></product-tabs>
        </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    variantSale: 1
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    variantSale: 0
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },     
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
            this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },      
        removeFromCart() {
            this.$emit('remove-from-cart',
            this.variants[this.selectedVariant].variantId);
        },    
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale(){
            return this.variants[this.selectedVariant].variantSale
        },
        shipping(){
            if (this.premium) {
                return 'Free'
            } else {
                return 2.99
            }
        },
    }
},
Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>

            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name">
            </p>

            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            <p>
                <label for="recommend">Would you recommend this product?</label>
                <div class="radio">
                    <p class="radio1"><input type="radio" name="recommend" v-model="recommend" id="Yes" value="Yes">Yes</p>
                    <p class="radio2"><input type="radio" name="recommend" v-model="recommend" id="No" value="No">No</p>
                </div>
            </p>

            <p>
                <input type="submit" value="Submit"> 
            </p>
        </form>
`,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend:null,
            errors: []
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommend required.")
            }
        }
    }
 })
)

Vue.component('product-details', {
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral']
        }
    }
})

Vue.component('product-shipping', {
    template: `
        <p>{{ shipping }}</p>
    `,
    computed: {
        shipping(){
            if (this.premium) {
                return 'Free'
            } else {
                return 2.99
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },  

    template: `
    <div>   
      <ul>
        <span class="tab"
              :class="{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs"
              @click="selectedTab = tab"
        >{{ tab }}</span>
      </ul>
      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
          <p>{{ review.name }}</p>
          <p>Rating: {{ review.rating }}</p>
          <p>{{ review.review }}</p>
          <p>Would you recommend this product? {{ review.recommend }}</p>
          </li>
        </ul>
      </div>
      <div v-show="selectedTab === 'Make a Review'">
      <product-review></product-review>
      </div>
      <div v-show="selectedTab === 'Details'">
      <product-details></product-details>
      </div>
      <div v-show="selectedTab === 'Shipping'">
      <product-shipping></product-shipping>
      </div>
    </div>
`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'  // устанавливается с помощью @click
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeCart(id) {
            this.cart.pop(id);
        },
    }
})