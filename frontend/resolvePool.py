import boto3
import json

def fix_cognito_login_for_pool():
    cognito = boto3.client('cognito-idp', region_name='us-east-1')
    user_pool_id = "us-east-1_izlMRmzQz"
    domain_name = "us-east-1izlmrmzqz"
    
    try:
        print(f"🔧 Fixing Cognito configuration for User Pool: {user_pool_id}")
        
        # Step 1: Get app clients
        print("1. Getting app clients...")
        clients_response = cognito.list_user_pool_clients(UserPoolId=user_pool_id)
        print("adding ---")
        clients = clients_response['UserPoolClients']
        print("closing ---")
        if not clients:
            print("   ❌ No app clients found. Create an app client first.")
            return False
        
        print(f"   Found {len(clients)} app client(s):")
        for client in clients:
            print(f"   - {client['ClientName']} (ID: {client['ClientId']})")
        
        # Use the first client or specify which one
        client_id = clients[0]['ClientId']
        client_name = clients[0]['ClientName']
        print(f"   Using client: {client_name} ({client_id})")
        
        # Step 2: Check domain status
        print("2. Checking domain status...")
        try:
            domain_info = cognito.describe_user_pool_domain(Domain=domain_name)
            status = domain_info['DomainDescription']['Status']
            print(f"   Domain status: {status}")
            
            if status != 'ACTIVE':
                print("   ⚠️  Domain is not active. This might be the issue.")
        except Exception as e:
            print(f"   ❌ Domain issue: {e}")
        
        # Step 3: Configure OAuth settings
        print("3. Configuring OAuth settings...")
        cognito.update_user_pool_client(
            UserPoolId=user_pool_id,
            ClientId=client_id,
            AllowedOAuthFlows=['code', 'implicit'],
            AllowedOAuthScopes=['openid', 'email', 'profile'],
            AllowedOAuthFlowsUserPoolClient=True,
            CallbackURLs=[
                'http://localhost:3000/callback',
                'https://example.com/callback'
            ],
            LogoutURLs=[
                'http://localhost:3000/logout',
                'https://example.com/logout'
            ],
            SupportedIdentityProviders=['COGNITO']
        )
        print("   ✅ OAuth settings updated")
        
        # Step 4: Verify configuration
        print("4. Verifying configuration...")
        client_info = cognito.describe_user_pool_client(
            UserPoolId=user_pool_id,
            ClientId=client_id
        )
        
        client_details = client_info['UserPoolClient']
        oauth_flows = client_details.get('AllowedOAuthFlows', [])
        oauth_scopes = client_details.get('AllowedOAuthScopes', [])
        callback_urls = client_details.get('CallbackURLs', [])
        has_secret = 'ClientSecret' in client_details
        
        print(f"   Client Name: {client_details['ClientName']}")
        print(f"   Client ID: {client_id}")
        print(f"   Has Secret: {has_secret}")
        print(f"   OAuth Flows: {oauth_flows}")
        print(f"   OAuth Scopes: {oauth_scopes}")
        print(f"   Callback URLs: {callback_urls}")
        
        # Step 5: Generate login URL
        login_url = f"https://{domain_name}.auth.us-east-1.amazoncognito.com/login?client_id={client_id}&response_type=code&scope=openid&redirect_uri=http://localhost:3000/callback"
        
        print("\n" + "="*60)
        print("✅ Configuration Complete!")
        print(f"🔗 Login URL: {login_url}")
        print(f"📱 Test in browser: https://{domain_name}.auth.us-east-1.amazoncognito.com/login")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

# Run the fix
if __name__ == "__main__":
    fix_cognito_login_for_pool()
