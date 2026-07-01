import React from "react";
import { Shield, HelpCircle, AppWindow } from "lucide-react";

export const RoutesOverview: React.FC = () => {
  return (
    <div className="container" style={{ gap: "var(--space-lg)" }}>
      
      {/* Header Info */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <div>
          <span className="tag">API SPECIFICATION</span>
        </div>
        <h1 style={{ lineHeight: 1.15 }}>Developer & Client Routes</h1>
        <p className="lead" style={{ maxWidth: "800px", color: "var(--fg)" }}>
          Documentation of the active provider endpoints, request models, response formats, and security policies.
        </p>
      </section>

      {/* Routes Bento Container */}
      <div className="bento-grid">
        
        {/* OIDC Core Protocols - Span 12 */}
        <div className="bento-card span-12" style={{ gap: "var(--space-md)", background: "rgba(10, 10, 15, 0.45)" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <HelpCircle size={16} style={{ color: "var(--accent)" }} /> 
              <span>OIDC Core Endpoints</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
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
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)", background: "rgba(255,255,255,0.03)", padding: "3px 6px", borderRadius: "3px" }}>Public</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/.well-known/jwks.json</code></td>
                  <td style={{ color: "var(--muted)", fontStyle: "italic" }}>None</td>
                  <td>Array of JSON Web Keys used to sign tokens</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)", background: "rgba(255,255,255,0.03)", padding: "3px 6px", borderRadius: "3px" }}>Public</span></td>
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
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--accent)", background: "rgba(0, 240, 255, 0.05)", padding: "3px 6px", borderRadius: "3px", border: "1px solid rgba(0, 240, 255, 0.1)" }}>Session Cookie</span></td>
                </tr>
                <tr>
                  <td><span className="method-tag">POST</span></td>
                  <td><code>/o/token</code></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", lineHeight: 1.45, background: "rgba(5, 5, 8, 0.4)", padding: "6px", borderRadius: "4px", border: "1px solid var(--glass-border)" }}>
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
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", lineHeight: 1.45, background: "rgba(5, 5, 8, 0.4)", padding: "6px", borderRadius: "4px", border: "1px solid var(--glass-border)" }}>
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
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)", background: "rgba(255, 255, 255, 0.03)", padding: "3px 6px", borderRadius: "3px" }}>Basic / POST</span>
                  </td>
                </tr>
                <tr>
                  <td><span className="method-tag">GET</span></td>
                  <td><code>/o/userinfo</code></td>
                  <td style={{ color: "var(--muted)" }}>Authorization: Bearer [access_token]</td>
                  <td>JSON object containing verified user claims based on approved scopes</td>
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--accent)", background: "rgba(0, 240, 255, 0.05)", padding: "3px 6px", borderRadius: "3px", border: "1px solid rgba(0, 240, 255, 0.1)" }}>Bearer Token</span></td>
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
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)", background: "rgba(255,255,255,0.03)", padding: "3px 6px", borderRadius: "3px" }}>Credentials</span></td>
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
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)", background: "rgba(255,255,255,0.03)", padding: "3px 6px", borderRadius: "3px" }}>Credentials</span></td>
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
                  <td><span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--fg-white)", background: "rgba(255,255,255,0.03)", padding: "3px 6px", borderRadius: "3px" }}>Public</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Developer Client Lifecycle - Span 6 */}
        <div className="bento-card span-6" style={{ gap: "var(--space-md)" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <AppWindow size={16} style={{ color: "var(--accent)" }} /> 
              <span>Developer Client Management</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Endpoints for self-registering client application details.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="method-tag">GET</span>
                <code style={{ color: "var(--fg-white)" }}>/clients/register</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Renders the client self-registration page. Requires an active logged-in session.
              </p>
            </div>
            
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="method-tag">POST</span>
                <code style={{ color: "var(--fg-white)" }}>/clients/register</code>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
                <p style={{ color: "var(--fg)", opacity: 0.85 }}>
                  Submits a registration request for admin review.
                </p>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--fg)", background: "rgba(5, 5, 8, 0.5)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", lineHeight: 1.45 }}>
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
        <div className="bento-card span-6" style={{ gap: "var(--space-md)" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--fg-white)" }}>
              <Shield size={16} style={{ color: "var(--accent)" }} /> 
              <span>Admin Approval Queues</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Endpoints restricted to administrative roles for reviewing clients.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="method-tag">GET</span>
                <code style={{ color: "var(--fg-white)" }}>/admin/registrations</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Retrieves all submitted registrations with state <code>pending</code>.
              </p>
            </div>

            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="method-tag">POST</span>
                <code style={{ color: "var(--fg-white)" }}>/admin/registrations/:id/approve</code>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--fg)", opacity: 0.85 }}>
                Approves client, creates OAuth entity, hashes secret, and returns cleartext credentials.
              </p>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
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
