/*

Functionality
    User rome the city

    functions
        1. ✅ Collect points
            Points vary based on input factors.abort
        2. ✅ Reedem points
        3. Trade points
            Create assets for game, such that users will claim the assets with tokens.abort
        4. Burn points
        5. ✅ Get points by address
        6. ✅ transfer points
        7. ✅ add points
        8. ✅ deduct points


*/
#[allow(unused_const, duplicate_alias, unused_let_mut, unused_trailing_semi, unused_mut_parameter, unused_use)]

module pokemongame::pokemongame;


use one::table;
use one::object::{Self, UID, ID};
use one::tx_context::TxContext;
use std::string::String;
use one::transfer;

const E_Not_Enough_Points:u64 = 103;

public struct UserPoints has key {
    id:UID,
    balance: table::Table<address, u256>
}

public struct UserPowerUps has key {
    id:UID,
    asset:String
}


fun init(ctx: &mut TxContext) {
    let userPointsObj = UserPoints { 
        id:object::new(ctx),
        balance: table::new(ctx) };
    transfer::share_object(userPointsObj);
    
}

public fun get_points(userPts:&mut UserPoints, amount:u256, ctx: &mut TxContext) {
    let recipient = ctx.sender();
    if (table::contains(&userPts.balance, recipient)) {
        let old_balance = table::borrow(&userPts.balance, recipient);
        let new_balance = *old_balance + amount;
        table::remove(&mut userPts.balance, recipient);     // remove old entry
        table::add(&mut userPts.balance, recipient, new_balance);
    } else {
        table::add(&mut userPts.balance, recipient, amount);
    };
}

public fun transfer_points(userPts:&mut UserPoints, amount:u256, recipient:address, ctx: &mut TxContext) {
    let sender = ctx.sender();
    if (table::contains(&userPts.balance, sender)) {

        let sender_current_bal_ref = table::borrow(&userPts.balance,sender);
        let sender_current_bal = *sender_current_bal_ref;
        assert!(sender_current_bal > amount, E_Not_Enough_Points); // User don't have enough funds
        let sender_updated_balance = sender_current_bal - amount;
        table::remove(&mut userPts.balance, sender);
        table::add(&mut userPts.balance, sender, sender_updated_balance);


        if (!table::contains(&userPts.balance,recipient)) {
        // If users don't have token previously, simple add the data to table
            table::add(&mut userPts.balance, recipient, amount);
        }
        else {
            let recipient_current_bal_ref = table::borrow(&userPts.balance,recipient);
            let recipient_current_bal = *recipient_current_bal_ref;
            let recipient_updated_bal = recipient_current_bal + amount;

            table::remove(&mut userPts.balance, recipient);
            table::add(&mut userPts.balance, recipient, recipient_updated_bal);
        }

    } else {
        abort // User don't have any points.
    };
}

public fun reedem_points(userPts:&mut UserPoints, amount:u256, ctx: &mut TxContext) {
    let recipient = ctx.sender();

    if (table::contains(&userPts.balance, recipient)) {
        let user_points_ref = table::borrow(&userPts.balance, recipient);
        let user_points = *user_points_ref;
        assert!(user_points>= amount,E_Not_Enough_Points );

        if(amount == 280) {
            let userpower = UserPowerUps{
                id: object::new(ctx),
                asset: b"Aquifer Petal ".to_string()
            };
            transfer::transfer(userpower,  recipient);
        };
        if(amount ==320) {
            let userpower = UserPowerUps{
                id: object::new(ctx),
                asset: b"Ember Flare Charm".to_string()
            };
            transfer::transfer(userpower,  recipient);
        };
        if(amount == 360) {
            let userpower = UserPowerUps{
                id: object::new(ctx),
                asset: b"Lunar Bloom Crest".to_string()
            };
            transfer::transfer(userpower,  recipient);
        };
        if(amount == 450) {
            let userpower = UserPowerUps{
                id: object::new(ctx),
                asset: b"Starlit Core Relic".to_string()
            };
            transfer::transfer(userpower,  recipient);
        };
        if(amount == 500) {
            let userpower = UserPowerUps{
                id: object::new(ctx),
                asset: b"Aegis Prism".to_string()
            };
            transfer::transfer(userpower,  recipient);
        };


        table::remove(&mut userPts.balance, recipient);     
        table::add(&mut userPts.balance, recipient, user_points - amount);
    } else {
        abort // User don't have any points.
    };
}

public fun get_user_points(userPoints: & UserPoints, _address: address): u256{
    let user_bal = table::borrow(&userPoints.balance, _address);
    let bal = *user_bal;
    bal
}

#[test]

// Function to add tokens, user on function call, user will able to get the tokens
fun test_add_points() {
    use one::test_scenario;
    use std::unit_test::assert_eq;
    use one::test_scenario::sender;

    let add1 = @0xa1;

    let mut scenario = test_scenario::begin(add1);
    {
        init(scenario.ctx());
    };
    scenario.next_tx(add1);
    {
        let mut userPointsId = scenario.take_shared<UserPoints>();
        get_points(&mut userPointsId, 100, scenario.ctx());
        test_scenario::return_shared(userPointsId);
    };
    scenario.next_tx(add1);
    {
        let userPointsId = scenario.take_shared<UserPoints>();
        let userBal = get_user_points(&userPointsId, add1);
        assert_eq!(userBal, 100);
        test_scenario::return_shared(userPointsId);
    };
    scenario.end();

}

#[test]
// Funciton to add points, then transfer the points to another users & check updated points
fun test_transfer_points() {
    use one::test_scenario;
    use std::unit_test::assert_eq;
    use one::test_scenario::sender;

    let add1 = @0xa1;
    let add2 = @0xb2;

    let mut scenario = test_scenario::begin(add1);
    {
        init(scenario.ctx());
    };
    scenario.next_tx(add1);
    {
        let mut userPointsId = scenario.take_shared<UserPoints>();
        get_points(&mut userPointsId, 100, scenario.ctx());
        test_scenario::return_shared(userPointsId);
    };
    scenario.next_tx(add1);
    // Tranfer 50 tokens to add2
    {
        let mut userPointsId = scenario.take_shared<UserPoints>();
        transfer_points(&mut userPointsId, 40, add2, scenario.ctx());
        
        let userBal1 = get_user_points(&userPointsId, add1);
        let userBal2 = get_user_points(&userPointsId, add2);
        assert_eq!(userBal1, 60);
        assert_eq!(userBal2, 40);
        test_scenario::return_shared(userPointsId);
    };
    scenario.end();
}

#[test]
// Get new points, and reedem points to collect new powers
fun test_reedem_points() {
    use one::test_scenario;
    use std::unit_test::assert_eq;
    use one::test_scenario::sender;

    let add1 = @0xa1;

    let mut scenario = test_scenario::begin(add1);
    {
        init(scenario.ctx());
    };
    scenario.next_tx(add1);
    {
        let mut userPointsId = scenario.take_shared<UserPoints>();
        get_points(&mut userPointsId, 400, scenario.ctx());
        test_scenario::return_shared(userPointsId);
    };
    // Purchase a "Shield Orb" worth 100 points
    scenario.next_tx(add1);
    {
        let mut userPointsId = scenario.take_shared<UserPoints>();
        reedem_points(&mut userPointsId, 360, scenario.ctx());
        
        let userBal1 = get_user_points(&userPointsId, add1);
        assert_eq!(userBal1, 40);
        test_scenario::return_shared(userPointsId);
    };
    // Check weather the users have the UserPowerUps or not
    scenario.next_tx(add1);
    {
        let userPowerUps = scenario.take_from_address<UserPowerUps>(add1);
        assert_eq!(userPowerUps.asset, b"Lunar Bloom Crest".to_string());
        
        test_scenario::return_to_address(add1, userPowerUps);
    };
    scenario.end();
}