import { internet } from 'faker'
import { bookServiceFactory } from '../../src/service/bookService'
import { customerServiceFactory } from '../../src/service/customerService'
import { testDynamoClient } from '../awsTestClients'
import { testAddress, testCustomer } from '../testFactories'

const customerService = customerServiceFactory(testDynamoClient)
const bookService = bookServiceFactory(testDynamoClient)

describe('managing one to many relationships', () => {
  describe('books', () => {
    it('model relationship between book and author', async () => {
      const jk = 'JK Rowling'
      const king = 'Stephen King'
      const it: Book = {
        author: king,
        title: 'IT',
        release_year: 1986
      }
      const shining: Book = {
        author: king,
        title: 'The Shining',
        release_year: 1977
      }
      const harryPotter = {
        author: jk,
        title: `Harry Potter and the sorcerer's stone`,
        release_year: 1997
      }
      const testBook: Book = {
        author: 'Gary Alway',
        title: 'DynamoDB design patterns',
        release_year: 1997
      }

      await Promise.all([
        bookService.saveBook(testBook),
        bookService.saveBook(it),
        bookService.saveBook(shining),
        bookService.saveBook(harryPotter)
      ])

      const bookByTitle = await bookService.getBookByTitle('The Shining')
      expect(bookByTitle).toEqual(shining)

      const booksByAuthor = await bookService.getBooksByAuthor(king)
      expect(booksByAuthor).toEqual([it, shining])

      const booksByYear = await bookService.getBooksByReleaseYear(1997)
      expect(booksByYear).toEqual([testBook, harryPotter])
    })
  })

  describe('customers', () => {
    it('model customer addresses inside a customer record', async () => {
      const address1 = testAddress()
      const address2 = testAddress()
      const customer = testCustomer({ addresses: [address1, address2] })

      await customerService.saveCustomer(customer)

      const result = await customerService.getCustomer(customer.id)
      expect(result).toEqual(customer)

      const search = await customerService.searchCustomers(customer.username)
      expect(search).toEqual([customer])
    })

    it('searches for customers using an overloaded GSI', async () => {
      const username = internet.userName()

      await Promise.all([
        customerService.saveCustomer(testCustomer({ username })),
        customerService.saveCustomer(testCustomer({ username })),
        customerService.saveCustomer(testCustomer()),
        customerService.saveCustomer(testCustomer({ username }))
      ])

      const search = await customerService.searchCustomers(username)
      expect(search.length).toBe(3)
    })
  })
})
