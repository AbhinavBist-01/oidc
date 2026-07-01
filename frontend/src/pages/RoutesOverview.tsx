import React from "react";
import { Shield, HelpCircle, AppWindow } from "lucide-react";

export const RoutesOverview: React.FC = () => {
  return (
    <div className="container" style={{ gap: "48px", padding: "64px 24px" }}>
      
      {/* Header Info */}
      <section style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div>
          <span className="tag">API SPECIFICATION</span>
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 800 }}>Developer & Client Routes</h1>
        <p className="lead" style={{ maxWidth: "800px", color: "var(--fg)", fontSize: "1.02rem" }}>
          Documentation of the active provider endpoints, request models, response formats, and security policies.
        </p>
      </section>

      {/* Routes Bento Container */}
      <div className="bento-grid">
        
        {/* OIDC Core Protocols - Span 12 */}
        <div className="bento-card span-12" style={{ gap: "24px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <HelpCircle size={16} /> 
              <span>OIDC Core Endpoints</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px" }}>
              Standard OIDC/OAuth 2.0 discovery and token exchange endpoints.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="endpoint-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Method</th>
                  <th>Route Path</th>
                  <th>Parameters / Body</th>
                  <th>Response Schema</th>
                  <th style={{ width: "120px" }}>Access</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/.well-known/openid-configuration</code></td>
                  <td style={{ color: "var(--muted)", fontStyle: "italic" }}>None</td>
                  <td>OIDC metadata JSON configuration object</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Public</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/.well-known/jwks.json</code></td>
                  <td style={{ color: "var(--muted)", fontStyle: "italic" }}>None</td>
                  <td>Array of JSON Web Keys used to sign tokens</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Public</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/o/authorize</code></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", lineHeight: 1.45 }}>
                      ?response_type=code<br />
                      &client_id=[uuid]<br />
                      &redirect_uri=[url]<br />
                      &scope=openid [profile] [email]<br />
                      &state=[string]<br />
                      &code_challenge=[string]<br />
                      &code_challenge_method=S256|plain
                    </div>
                  </td>
                  <td>Redirects to Consent page or returns auth code</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Session Cookie</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">POST</span></td>
                  <td><code>/o/token</code></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", lineHeight: 1.45, background: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                      <strong>Body (JSON):</strong><br />
                      {`{`}<br />
                      &nbsp;&nbsp;grant_type: "authorization_code",<br />
                      &nbsp;&nbsp;code: "[auth_code]",<br />
                      &nbsp;&nbsp;redirect_uri: "[callback]",<br />
                      &nbsp;&nbsp;code_verifier: "[verifier]"<br />
                      {`}`}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", lineHeight: 1.45, background: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                      {`{`}<br />
                      &nbsp;&nbsp;access_token: "[jwt]",<br />
                      &nbsp;&nbsp;id_token: "[jwt]",<br />
                      &nbsp;&nbsp;refresh_token: "[string]",<br />
                      &nbsp;&nbsp;token_type: "Bearer",<br />
                      &nbsp;&nbsp;expires_in: 3600<br />
                      {`}`}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>POST Credentials</span>
                  </td>
                </tr>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/o/userinfo</code></td>
                  <td style={{ color: "var(--muted)", fontStyle: "italic" }}>Authorization: Bearer [access_token]</td>
                  <td>JSON object containing verified user claims based on approved scopes</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Bearer Token</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">POST</span></td>
                  <td><code>/o/revoke</code></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)" }}>
                      Body: {`{ token: "[refresh_token]" }`}
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)", fontStyle: "italic" }}>Empty (HTTP 200)</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Credentials</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">POST</span></td>
                  <td><code>/o/introspect</code></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)" }}>
                      Body: {`{ token: "[token_string]" }`}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)" }}>
                      {`{ active: true, sub: "[userId]", ... }`}
                    </div>
                  </td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Credentials</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/o/logout</code></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", lineHeight: 1.45 }}>
                      ?id_token_hint=[id_token]<br />
                      &post_logout_redirect_uri=[url]
                    </div>
                  </td>
                  <td>Clears session and redirects to post logout redirect URI or root</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)" }}>Public</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Developer Client Lifecycle - Span 6 */}
        <div className="bento-card span-6" style={{ gap: "24px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <AppWindow size={16} /> 
              <span>Developer Client Management</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px" }}>
              Endpoints for self-registering client application details.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="method-tag">GET</span>
                <code style={{ color: "var(--fg-white)" }}>/clients/register</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Renders the client self-registration page. Requires an active logged-in session.
              </p>
            </div>
            
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="method-tag">POST</span>
                <code style={{ color: "var(--fg-white)" }}>/clients/register</code>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem" }}>
                <p style={{ color: "var(--fg)", opacity: 0.85 }}>
                  Submits a registration request for admin review.
                </p>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", background: "rgba(255,255,255,0.01)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", lineHeight: 1.45 }}>
                  <strong>Body Schema:</strong><br />
                  {`{`}<br />
                  &nbsp;&nbsp;clientName: "[app_name]",<br />
                  &nbsp;&nbsp;redirectUris: ["[callback]"],<br />
                  &nbsp;&nbsp;description: "[app_description]"<br />
                  {`}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Administrator Dashboards - Span 6 */}
        <div className="bento-card span-6" style={{ gap: "24px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <Shield size={16} /> 
              <span>Admin Approval Queues</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px" }}>
              Endpoints restricted to administrative roles for reviewing clients.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="method-tag">GET</span>
                <code style={{ color: "var(--fg-white)" }}>/admin/registrations</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Retrieves all submitted registrations with state <code>pending</code>.
              </p>
            </div>

            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="method-tag">POST</span>
                <code style={{ color: "var(--fg-white)" }}>/admin/registrations/:id/approve</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Approves client, creates OAuth entity, hashes secret, and returns cleartext credentials.
              </p>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="method-tag">POST</span>
                <code style={{ color: "var(--fg-white)" }}>/admin/registrations/:id/reject</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Rejects client registration. Discards client registration record.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoutesOverview;
