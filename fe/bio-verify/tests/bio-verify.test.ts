import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { BioVerify_Agent_PickReviewers } from "../generated/schema"
import { BioVerify_Agent_PickReviewers as BioVerify_Agent_PickReviewersEvent } from "../generated/BioVerify/BioVerify"
import { handleBioVerify_Agent_PickReviewers } from "../src/bio-verify"
import { createBioVerify_Agent_PickReviewersEvent } from "./bio-verify-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let pubId = BigInt.fromI32(234)
    let reviewers = [
      Address.fromString("0x0000000000000000000000000000000000000001")
    ]
    let seniorReviewer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let cid = "Example string value"
    let newBioVerify_Agent_PickReviewersEvent =
      createBioVerify_Agent_PickReviewersEvent(
        pubId,
        reviewers,
        seniorReviewer,
        cid
      )
    handleBioVerify_Agent_PickReviewers(newBioVerify_Agent_PickReviewersEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("BioVerify_Agent_PickReviewers created and stored", () => {
    assert.entityCount("BioVerify_Agent_PickReviewers", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BioVerify_Agent_PickReviewers",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pubId",
      "234"
    )
    assert.fieldEquals(
      "BioVerify_Agent_PickReviewers",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "reviewers",
      "[0x0000000000000000000000000000000000000001]"
    )
    assert.fieldEquals(
      "BioVerify_Agent_PickReviewers",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seniorReviewer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BioVerify_Agent_PickReviewers",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "cid",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
